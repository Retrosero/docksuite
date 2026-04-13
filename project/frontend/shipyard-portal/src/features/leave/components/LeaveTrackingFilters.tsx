import { getLeaveStatusOptions } from "../services/leaveTrackingService";
import type { LeaveFilterState, LeaveTrackingViewMode } from "../types";

type LeaveTrackingFiltersProps = {
  viewMode: LeaveTrackingViewMode;
  onViewModeChange: (value: LeaveTrackingViewMode) => void;
  canViewManager: boolean;
  filters: LeaveFilterState;
  onFiltersChange: (next: LeaveFilterState) => void;
  leaveTypeOptions: string[];
  onRefresh: () => void;
  loading: boolean;
};

export function LeaveTrackingFilters({
  viewMode,
  onViewModeChange,
  canViewManager,
  filters,
  onFiltersChange,
  leaveTypeOptions,
  onRefresh,
  loading
}: LeaveTrackingFiltersProps) {
  const statusOptions = getLeaveStatusOptions();

  return (
    <section className="screen-card leave-panel leave-panel--filters">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Gorunum ve filtre</p>
          <h3>Izin tarama alani</h3>
        </div>
        <button className="leave-refresh-button" disabled={loading} onClick={onRefresh} type="button">
          Yenile
        </button>
      </div>

      {canViewManager ? (
        <div className="leave-view-toggle" role="tablist" aria-label="Izin gorunumu">
          <button
            aria-selected={viewMode === "manager"}
            className={viewMode === "manager" ? "is-active" : ""}
            onClick={() => onViewModeChange("manager")}
            type="button"
          >
            Yonetici onay
          </button>
          <button
            aria-selected={viewMode === "employee"}
            className={viewMode === "employee" ? "is-active" : ""}
            onClick={() => onViewModeChange("employee")}
            type="button"
          >
            Izinlerim
          </button>
        </div>
      ) : (
        <p className="leave-mode-note">Rol bazli erisim nedeniyle sadece calisanin izinleri goruntuleniyor.</p>
      )}

      <div className="leave-filter-grid">
        <label>
          <span>Izin tipi</span>
          <select
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                leaveType: event.target.value
              })
            }
            value={filters.leaveType}
          >
            <option value="">Tum izin tipleri</option>
            {leaveTypeOptions.map((leaveType) => (
              <option key={leaveType} value={leaveType}>
                {leaveType}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Onay durumu</span>
          <select
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                status: event.target.value
              })
            }
            value={filters.status}
          >
            <option value="">Tum durumlar</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "Open"
                  ? "Onay bekliyor"
                  : status === "Approved"
                    ? "Onaylandi"
                    : status === "Rejected"
                      ? "Reddedildi"
                      : "Iptal"}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Calisan / izin tipi ara</span>
          <input
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                searchText: event.target.value
              })
            }
            placeholder="Calisan, sicil veya izin tipi"
            type="search"
            value={filters.searchText}
          />
        </label>
      </div>
    </section>
  );
}
