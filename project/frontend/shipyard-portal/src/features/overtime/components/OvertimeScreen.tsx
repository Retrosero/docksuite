import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useOvertimeActorAccess } from "../hooks/useOvertimeActorAccess";
import { useOvertimeData } from "../hooks/useOvertimeData";
import type { OvertimeFilterState } from "../types";
import { OvertimeCreateForm } from "./OvertimeCreateForm";
import { OvertimeFilters } from "./OvertimeFilters";
import { OvertimeRequestList } from "./OvertimeRequestList";
import { OvertimeSummaryCards } from "./OvertimeSummaryCards";

const INITIAL_FILTERS: OvertimeFilterState = {
  employee: "",
  status: "",
  startDate: "",
  endDate: "",
  searchText: ""
};

export function OvertimeScreen() {
  const [viewMode, setViewMode] = useState<"employee" | "manager">("employee");
  const [isActorDefaultApplied, setIsActorDefaultApplied] = useState(false);
  const { access, loading: actorAccessLoading } = useOvertimeActorAccess();
  const [filters, setFilters] = useState<OvertimeFilterState>(INITIAL_FILTERS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const deferredSearchText = useDeferredValue(filters.searchText);
  const effectiveViewMode = access.canViewManager ? viewMode : "employee";
  const effectiveFilters = {
    ...filters,
    searchText: deferredSearchText
  };

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

      {showCreateForm && data ? (
        <OvertimeCreateForm
          employeeOptions={data.employeeOptions}
          activeEmployeeId={data.activeEmployeeId}
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
