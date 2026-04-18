import type { ShiftPlanEmployee, ShiftPlanningFilterState, ShiftTypeInfo } from "../types";

type ShiftPlanningFiltersProps = {
  filters: ShiftPlanningFilterState;
  onFiltersChange: (next: ShiftPlanningFilterState) => void;
  shiftTypes: ShiftTypeInfo[];
  employees: ShiftPlanEmployee[];
  onRefresh: () => void;
  loading: boolean;
  onCreateNew: () => void;
};

function formatShiftTypeLabel(type: ShiftTypeInfo) {
  const start = (type.start_time ?? "").trim();
  const end = (type.end_time ?? "").trim();
  if (start && end) return `${type.label} (${start}-${end})`;
  if (start) return `${type.label} (${start})`;
  if (end) return `${type.label} (${end})`;
  return `${type.label} (Saat tanimsiz)`;
}

export function ShiftPlanningFilters({
  filters,
  onFiltersChange,
  shiftTypes,
  employees,
  onRefresh,
  loading,
  onCreateNew
}: ShiftPlanningFiltersProps) {
  return (
    <section className="screen-card shift-plan-panel shift-plan-panel--filters">
      <div className="shift-plan-toolbar">
        <div className="shift-plan-toolbar__copy">
          <p className="eyebrow">Filtreler</p>
          <h3>Vardiya atamalarini filtrele</h3>
          <p className="shift-plan-hint">Vardiya tipleri ERPNext HRMS icindeki <strong>Shift Type</strong> kayitlarindan gelir.</p>
        </div>

        <div className="shift-plan-toolbar__actions">
          <button className="shift-plan-refresh-button" disabled={loading} onClick={onRefresh} type="button">
            Yenile
          </button>
          <button
            className="btn btn--primary"
            onClick={onCreateNew}
            type="button"
            disabled={shiftTypes.length === 0 || employees.length === 0}
          >
            + Yeni Plan
          </button>
        </div>
      </div>

      {shiftTypes.length === 0 ? (
        <p className="shift-plan-empty-state shift-plan-empty-state--warning">
          Vardiya tipi bulunamadi. ERPNext tarafinda Shift Type kaydi olusturulduktan sonra secim listesinde gorunur.
        </p>
      ) : null}

      {employees.length === 0 ? (
        <p className="shift-plan-empty-state shift-plan-empty-state--warning">
          Personel listesi bos. Once personel kaydi olusturun.
        </p>
      ) : null}

      <div className="shift-plan-filter-grid">
        <label>
          <span>Personel</span>
          <select
            onChange={(event) => onFiltersChange({ ...filters, employee: event.target.value })}
            value={filters.employee}
            disabled={employees.length === 0}
          >
            <option value="">Tum personeller</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Vardiya tipi</span>
          <select
            onChange={(event) => onFiltersChange({ ...filters, shiftType: event.target.value })}
            value={filters.shiftType}
            disabled={shiftTypes.length === 0}
          >
            <option value="">Tum vardiyalar</option>
            {shiftTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {formatShiftTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Baslangic tarihi</span>
          <input
            type="date"
            onChange={(event) => onFiltersChange({ ...filters, startDate: event.target.value })}
            value={filters.startDate}
          />
        </label>

        <label>
          <span>Bitis tarihi</span>
          <input
            type="date"
            onChange={(event) => onFiltersChange({ ...filters, endDate: event.target.value })}
            value={filters.endDate}
          />
        </label>

        <label className="label--full">
          <span>Ara</span>
          <input
            type="search"
            placeholder="Personel veya vardiya ara..."
            onChange={(event) => onFiltersChange({ ...filters, searchText: event.target.value })}
            value={filters.searchText}
          />
        </label>
      </div>
    </section>
  );
}
