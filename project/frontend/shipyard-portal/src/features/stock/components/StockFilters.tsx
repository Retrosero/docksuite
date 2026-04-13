import type { StockFilterState } from "../types";

type StockFiltersProps = {
  filters: StockFilterState;
  itemGroupOptions: string[];
  loading: boolean;
  hasCriticalField: boolean;
  onFiltersChange: (next: StockFilterState) => void;
  onRefresh: () => void;
};

export function StockFilters({
  filters,
  itemGroupOptions,
  loading,
  hasCriticalField,
  onFiltersChange,
  onRefresh
}: StockFiltersProps) {
  return (
    <section className="panel stock-panel stock-panel--filters" aria-label="Stok filtreleri">
      <div className="stock-filter-grid">
        <label>
          <span>Arama</span>
          <input
            placeholder="Urun, barkod veya reyon ara"
            type="search"
            value={filters.searchText}
            onChange={(event) => {
              onFiltersChange({
                ...filters,
                searchText: event.target.value
              });
            }}
          />
        </label>

        <label>
          <span>Urun grubu</span>
          <select
            value={filters.itemGroup}
            onChange={(event) => {
              onFiltersChange({
                ...filters,
                itemGroup: event.target.value
              });
            }}
          >
            <option value="">Tum gruplar</option>
            {itemGroupOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Kritik filtre</span>
          <select
            disabled={!hasCriticalField}
            value={filters.criticalOnly ? "critical" : "all"}
            onChange={(event) => {
              onFiltersChange({
                ...filters,
                criticalOnly: event.target.value === "critical"
              });
            }}
          >
            <option value="all">Tum stoklar</option>
            <option value="critical">Sadece kritik stok</option>
          </select>
        </label>
      </div>

      {!hasCriticalField ? (
        <p className="stock-mode-note">Bu tenant'ta `is_critical_stock` alani bulunmuyor. Kritik filtre devre disi.</p>
      ) : null}

      <div className="stock-filter-actions">
        <button className="stock-refresh-button" disabled={loading} type="button" onClick={onRefresh}>
          Veriyi yenile
        </button>
      </div>
    </section>
  );
}
