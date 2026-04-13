import type { PurchaseInvoiceFilterState } from "../types";

type PurchaseInvoiceFiltersProps = {
  filters: PurchaseInvoiceFilterState;
  supplierOptions: string[];
  loading: boolean;
  onFiltersChange: (next: PurchaseInvoiceFilterState) => void;
  onRefresh: () => void;
};

export function PurchaseInvoiceFilters({
  filters,
  supplierOptions,
  loading,
  onFiltersChange,
  onRefresh
}: PurchaseInvoiceFiltersProps) {
  return (
    <section className="panel purchase-invoice-panel purchase-invoice-panel--filters" aria-label="Alis faturasi filtreleri">
      <div className="purchase-invoice-filter-grid">
        <label>
          <span>Tedarikci</span>
          <input
            list="purchase-invoice-supplier-options"
            placeholder="Tedarikci sec veya yaz"
            type="text"
            value={filters.supplier}
            onChange={(event) => {
              onFiltersChange({
                ...filters,
                supplier: event.target.value
              });
            }}
          />
          <datalist id="purchase-invoice-supplier-options">
            {supplierOptions.map((supplier) => (
              <option key={supplier} value={supplier} />
            ))}
          </datalist>
        </label>

        <label>
          <span>Baslangic tarihi</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => {
              onFiltersChange({
                ...filters,
                startDate: event.target.value
              });
            }}
          />
        </label>

        <label>
          <span>Bitis tarihi</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => {
              onFiltersChange({
                ...filters,
                endDate: event.target.value
              });
            }}
          />
        </label>

        <label>
          <span>Arama</span>
          <input
            placeholder="Fatura no, tedarikci veya sirket ara"
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
      </div>

      <div className="purchase-invoice-filter-actions">
        <button className="purchase-invoice-refresh-button" disabled={loading} type="button" onClick={onRefresh}>
          Veriyi yenile
        </button>
      </div>
    </section>
  );
}
