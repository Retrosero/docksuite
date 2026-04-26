import { startTransition, useDeferredValue, useState } from "react";
import { useStockData } from "../hooks/useStockData";
import type { StockFilterState } from "../types";
import { StockCardList } from "./StockCardList";
import { StockFilters } from "./StockFilters";
import { StockSummaryCards } from "./StockSummaryCards";
import { StockTable } from "./StockTable";
import { StockWarehouseCards } from "./StockWarehouseCards";
import { StockMaterialRequestQuickCreate } from "./StockMaterialRequestQuickCreate";
import { StockTransferQuickCreate } from "./StockTransferQuickCreate";

const INITIAL_FILTERS: StockFilterState = {
  itemGroup: "",
  searchText: "",
  criticalOnly: false
};

export function StockScreen() {
  const [filters, setFilters] = useState<StockFilterState>(INITIAL_FILTERS);
  const [selectedItemCode, setSelectedItemCode] = useState("");
  const deferredSearchText = useDeferredValue(filters.searchText);
  const effectiveFilters = {
    ...filters,
    searchText: deferredSearchText
  };
  const { data, loading, error, refresh } = useStockData({
    filters: effectiveFilters
  });

  return (
    <div className="stock-stack">
      <StockFilters
        filters={filters}
        hasCriticalField={Boolean(data?.hasCriticalField)}
        itemGroupOptions={data?.itemGroupOptions ?? []}
        loading={loading}
        onFiltersChange={(next) => {
          startTransition(() => {
            setFilters(next);
          });
        }}
        onRefresh={refresh}
      />

      {error ? <p className="stock-empty-state stock-empty-state--error">{error}</p> : null}
      {loading ? <p className="stock-empty-state">Stok verisi yukleniyor...</p> : null}

      {!loading && !error && data ? (
        <>
          <StockSummaryCards summary={data.summary} />
          <StockMaterialRequestQuickCreate
            items={data.items}
            selectedItemCode={selectedItemCode}
            onSelectedItemCodeChange={setSelectedItemCode}
            onCreated={refresh}
          />
          <StockTransferQuickCreate
            items={data.items}
            selectedItemCode={selectedItemCode}
            onSelectedItemCodeChange={setSelectedItemCode}
            onCreated={refresh}
          />
          <StockWarehouseCards rows={data.warehouseDistribution} />
          <div className="stock-mobile-only">
            <StockCardList
              hasCriticalField={data.hasCriticalField}
              rows={data.items}
              onQuickRequest={(itemCode) => {
                setSelectedItemCode(itemCode);
              }}
              onQuickTransfer={(itemCode) => {
                setSelectedItemCode(itemCode);
              }}
            />
          </div>
          <div className="stock-desktop-only">
            <StockTable
              hasCriticalField={data.hasCriticalField}
              rows={data.items}
              onQuickRequest={(itemCode) => {
                setSelectedItemCode(itemCode);
              }}
              onQuickTransfer={(itemCode) => {
                setSelectedItemCode(itemCode);
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
