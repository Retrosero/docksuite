import { getOvertimeStatusOptions } from "../services/overtimeService";
import type { OvertimeEmployeeOption, OvertimeFilterState } from "../types";

type OvertimeFiltersProps = {
  viewMode: "employee" | "manager";
  onViewModeChange: (value: "employee" | "manager") => void;
  canViewManager: boolean;
  filters: OvertimeFilterState;
  onFiltersChange: (next: OvertimeFilterState) => void;
  employeeOptions: OvertimeEmployeeOption[];
  onRefresh: () => void;
  loading: boolean;
  onCreateNew: () => void;
};

export function OvertimeFilters({
  viewMode,
  onViewModeChange,
  canViewManager,
  filters,
  onFiltersChange,
  employeeOptions,
  onRefresh,
  loading,
  onCreateNew
}: OvertimeFiltersProps) {
  const statusOptions = getOvertimeStatusOptions();

  return (
    <section className="screen-card overtime-panel overtime-panel--filters">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Filtre ve gorunum</p>
          <h3>Mesai kayitlarini filtrele</h3>
        </div>
        <div className="overtime-header-actions">
          <button className="overtime-refresh-button" disabled={loading} onClick={onRefresh} type="button">
            Yenile
          </button>
          <button className="btn btn--primary" onClick={onCreateNew} type="button">
            + Yeni Mesai
          </button>
        </div>
      </div>

      {canViewManager ? (
        <div className="overtime-view-toggle" role="tablist" aria-label="Mesai gorunumu">
          <button
            aria-selected={viewMode === "manager"}
            className={viewMode === "manager" ? "is-active" : ""}
            onClick={() => onViewModeChange("manager")}
            type="button"
          >
            Yonetici gorunumu
          </button>
          <button
            aria-selected={viewMode === "employee"}
            className={viewMode === "employee" ? "is-active" : ""}
            onClick={() => onViewModeChange("employee")}
            type="button"
          >
            Kendi mesailerim
          </button>
        </div>
      ) : (
        <p className="overtime-mode-note">Rol bazli erisim nedeniyle sadece kendi mesai kayitlariniz goruntuleniyor.</p>
      )}

      <div className="overtime-filter-grid">
        {viewMode === "manager" ? (
          <label>
            <span>Personel</span>
            <select
              onChange={(event) =>
                onFiltersChange({ ...filters, employee: event.target.value })
              }
              value={filters.employee}
            >
              <option value="">Tum personeller</option>
              {employeeOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label>
          <span>Durum</span>
          <select
            onChange={(event) =>
              onFiltersChange({ ...filters, status: event.target.value })
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
          <span>Baslangic tarihi</span>
          <input
            type="date"
            onChange={(event) =>
              onFiltersChange({ ...filters, startDate: event.target.value })
            }
            value={filters.startDate}
          />
        </label>

        <label>
          <span>Bitis tarihi</span>
          <input
            type="date"
            onChange={(event) =>
              onFiltersChange({ ...filters, endDate: event.target.value })
            }
            value={filters.endDate}
          />
        </label>

        <label className="label--full">
          <span>Ara</span>
          <input
            type="search"
            placeholder="Personel veya aciklama ara..."
            onChange={(event) =>
              onFiltersChange({ ...filters, searchText: event.target.value })
            }
            value={filters.searchText}
          />
        </label>
      </div>
    </section>
  );
}
