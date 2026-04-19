import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useOvertimeActorAccess } from "../hooks/useOvertimeActorAccess";
import { useOvertimeData } from "../hooks/useOvertimeData";
import type { OvertimeFilterState } from "../types";
import { OvertimeCreateForm } from "./OvertimeCreateForm";
import { OvertimeFilters } from "./OvertimeFilters";
import { OvertimeRequestList } from "./OvertimeRequestList";
import { OvertimeSummaryCards } from "./OvertimeSummaryCards";

function toDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getInitialFilters(): OvertimeFilterState {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    employee: "",
    status: "",
    startDate: toDateInputValue(firstDayOfMonth),
    endDate: toDateInputValue(lastDayOfMonth),
    searchText: ""
  };
}

export function OvertimeScreen() {
  const [viewMode, setViewMode] = useState<"employee" | "manager">("employee");
  const [isActorDefaultApplied, setIsActorDefaultApplied] = useState(false);
  const { access, loading: actorAccessLoading } = useOvertimeActorAccess();
  const [filters, setFilters] = useState<OvertimeFilterState>(() => getInitialFilters());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const deferredSearchText = useDeferredValue(filters.searchText);
  const effectiveViewMode = access.canViewManager ? viewMode : "employee";
  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      searchText: deferredSearchText
    }),
    [deferredSearchText, filters]
  );

  useEffect(() => {
    if (isActorDefaultApplied) {
      return;
    }

    if (actorAccessLoading) {
      return;
    }

    setViewMode(access.defaultViewMode);
    setIsActorDefaultApplied(true);
  }, [access.defaultViewMode, actorAccessLoading, isActorDefaultApplied]);

  const { data, loading, error, refresh } = useOvertimeData({
    viewMode: effectiveViewMode,
    filters: effectiveFilters
  });

  return (
    <div className="overtime-tracking-stack">
      <OvertimeFilters
        viewMode={effectiveViewMode}
        canViewManager={access.canViewManager}
        filters={filters}
        employeeOptions={data?.employeeOptions ?? []}
        loading={loading}
        onCreateNew={() => setShowCreateForm(true)}
        onFiltersChange={(next) => {
          startTransition(() => {
            setFilters(next);
          });
        }}
        onRefresh={refresh}
        onViewModeChange={(next) => {
          startTransition(() => {
            setViewMode(next);
          });
        }}
      />

      {error ? <p className="overtime-empty-state overtime-empty-state--error">{error}</p> : null}
      {loading ? <p className="overtime-empty-state">Mesai verisi yukleniyor...</p> : null}

      {!loading && !error && data ? (
        <>
          <OvertimeSummaryCards
            dateLabel={data.dateLabel}
            summary={data.summary}
            viewMode={effectiveViewMode}
          />
          <OvertimeRequestList rows={data.requests} viewMode={effectiveViewMode} />
        </>
      ) : null}

      {showCreateForm ? (
        <OvertimeCreateForm
          employeeOptions={data?.employeeOptions ?? []}
          activeEmployeeId={data?.activeEmployeeId ?? null}
          onSuccess={() => {
            setShowCreateForm(false);
            refresh();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : null}
    </div>
  );
}
