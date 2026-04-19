import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useShiftActorAccess } from "../hooks/useShiftActorAccess";
import { useShiftTrackingData } from "../hooks/useShiftTrackingData";
import type { ShiftFilterState, ShiftTrackingViewMode } from "../types";
import { ShiftTrackingFilters } from "./ShiftTrackingFilters";
import { ShiftOverviewCards } from "./ShiftOverviewCards";
import { ShiftTeamSummaryGrid } from "./ShiftTeamSummaryGrid";
import { ShiftEmployeeList } from "./ShiftEmployeeList";

const INITIAL_FILTERS: ShiftFilterState = {
  shiftType: "",
  status: "",
  searchText: ""
};

export function ShiftTrackingScreen() {
  const [viewMode, setViewMode] = useState<ShiftTrackingViewMode>("worker");
  const [isActorDefaultApplied, setIsActorDefaultApplied] = useState(false);
  const { access, loading: actorAccessLoading } = useShiftActorAccess();
  const [filters, setFilters] = useState<ShiftFilterState>(INITIAL_FILTERS);
  const deferredSearchText = useDeferredValue(filters.searchText);
  const effectiveViewMode = access.canViewForeman ? viewMode : "worker";
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

  const { data, loading, error, refresh } = useShiftTrackingData({
    viewMode: effectiveViewMode,
    filters: effectiveFilters
  });

  return (
    <div className="shift-tracking-stack">
      <ShiftTrackingFilters
        filters={filters}
        canViewForeman={access.canViewForeman}
        loading={loading}
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
        shiftTypes={data?.shiftTypes ?? []}
        viewMode={effectiveViewMode}
      />

      {error ? <p className="shift-empty-state shift-empty-state--error">{error}</p> : null}
      {loading ? <p className="shift-empty-state">Vardiya verisi yukleniyor...</p> : null}
      {!loading && !error && data?.infoMessage ? <p className="shift-mode-note">{data.infoMessage}</p> : null}

      {!loading && !error && data ? (
        <>
          <ShiftOverviewCards dateLabel={data.dateLabel} summary={data.summary} />
          {effectiveViewMode === "foreman" ? <ShiftTeamSummaryGrid rows={data.teamSummary} /> : null}
          <ShiftEmployeeList
            activeEmployeeId={data.activeEmployeeId}
            rows={data.employeeRows}
            viewMode={effectiveViewMode}
          />
        </>
      ) : null}
    </div>
  );
}
