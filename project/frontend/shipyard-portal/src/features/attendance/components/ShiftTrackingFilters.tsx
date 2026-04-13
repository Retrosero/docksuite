import type { ShiftFilterState, ShiftTrackingViewMode, ShiftTypeOption } from "../types";

type ShiftTrackingFiltersProps = {
  viewMode: ShiftTrackingViewMode;
  onViewModeChange: (value: ShiftTrackingViewMode) => void;
  filters: ShiftFilterState;
  onFiltersChange: (next: ShiftFilterState) => void;
  shiftTypes: ShiftTypeOption[];
  onRefresh: () => void;
  loading: boolean;
};

export function ShiftTrackingFilters({
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  shiftTypes,
  onRefresh,
  loading
}: ShiftTrackingFiltersProps) {
  return (
    <section className="screen-card shift-panel shift-panel--filters">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Gorunum secimi</p>
          <h3>Formen ve calisan modu</h3>
        </div>
        <button className="shift-refresh-button" disabled={loading} onClick={onRefresh} type="button">
          Yenile
        </button>
      </div>

      <div className="shift-view-toggle" role="tablist" aria-label="Vardiya gorunumu">
        <button
          aria-selected={viewMode === "foreman"}
          className={viewMode === "foreman" ? "is-active" : ""}
          onClick={() => onViewModeChange("foreman")}
          type="button"
        >
          Formen gorunumu
        </button>
        <button
          aria-selected={viewMode === "worker"}
          className={viewMode === "worker" ? "is-active" : ""}
          onClick={() => onViewModeChange("worker")}
          type="button"
        >
          Calisan gorunumu
        </button>
      </div>

      <div className="shift-filter-grid">
        <label>
          <span>Vardiya tipi</span>
          <select
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                shiftType: event.target.value
              })
            }
            value={filters.shiftType}
          >
            <option value="">Tum vardiyalar</option>
            {shiftTypes.map((shiftType) => (
              <option key={shiftType.id} value={shiftType.label}>
                {shiftType.label} ({shiftType.timeRange})
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Durum</span>
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
            <option value="Present">Katildi</option>
            <option value="Absent">Gelmedi</option>
            <option value="Half Day">Yarim gun</option>
            <option value="On Leave">Izinli</option>
          </select>
        </label>

        <label>
          <span>Calisan / ekip ara</span>
          <input
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                searchText: event.target.value
              })
            }
            placeholder="Calisan, sicil veya ekip"
            type="search"
            value={filters.searchText}
          />
        </label>
      </div>
    </section>
  );
}
