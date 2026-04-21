import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLeaveActorAccess } from "../hooks/useLeaveActorAccess";
import { useLeaveTrackingData } from "../hooks/useLeaveTrackingData";
import type { LeaveFilterState, LeaveTrackingViewMode } from "../types";
import { LeaveAllocationList } from "./LeaveAllocationList";
import { LeaveApplicationList } from "./LeaveApplicationList";
import { LeaveSummaryCards } from "./LeaveSummaryCards";
import { LeaveTrackingFilters } from "./LeaveTrackingFilters";

const INITIAL_FILTERS: LeaveFilterState = {
  leaveType: "",
  status: "",
  searchText: ""
};

export function LeaveTrackingScreen() {
  const [viewMode, setViewMode] = useState<LeaveTrackingViewMode>("employee");
  const [isActorDefaultApplied, setIsActorDefaultApplied] = useState(false);
  const { access, loading: actorAccessLoading } = useLeaveActorAccess();
  const [filters, setFilters] = useState<LeaveFilterState>(INITIAL_FILTERS);
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

  const { data, loading, error, refresh } = useLeaveTrackingData({
    viewMode: effectiveViewMode,
    filters: effectiveFilters
  });

  return (
    <div className="leave-tracking-stack">
      <LeaveTrackingFilters
        canViewManager={access.canViewManager}
        filters={filters}
        leaveTypeOptions={data?.leaveTypeOptions ?? []}
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
        viewMode={effectiveViewMode}
      />

      {error ? <p className="leave-empty-state leave-empty-state--error">{error}</p> : null}
      {loading ? <p className="leave-empty-state">Izin verisi yukleniyor...</p> : null}

      {!loading && !error && data ? (
        <>
          <LeaveSummaryCards dateLabel={data.dateLabel} summary={data.summary} viewMode={effectiveViewMode} />
          <LeaveAllocationList rows={data.allocations} />
          <LeaveApplicationList rows={data.applications} viewMode={effectiveViewMode} />
        </>
      ) : null}
    </div>
  );
}
