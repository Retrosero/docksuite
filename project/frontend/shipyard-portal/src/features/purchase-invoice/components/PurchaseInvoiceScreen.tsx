import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { usePurchaseInvoiceData } from "../hooks/usePurchaseInvoiceData";
import type { PurchaseInvoiceFilterState } from "../types";
import { PurchaseInvoiceCardList } from "./PurchaseInvoiceCardList";
import { PurchaseInvoiceDetailPanel } from "./PurchaseInvoiceDetailPanel";
import { PurchaseInvoiceFilters } from "./PurchaseInvoiceFilters";
import { PurchaseInvoiceSummaryCards } from "./PurchaseInvoiceSummaryCards";
import { PurchaseInvoiceTable } from "./PurchaseInvoiceTable";

const INITIAL_FILTERS: PurchaseInvoiceFilterState = {
  supplier: "",
  startDate: "",
  endDate: "",
  searchText: ""
};

export function PurchaseInvoiceScreen() {
  const [filters, setFilters] = useState<PurchaseInvoiceFilterState>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedInvoiceName, setSelectedInvoiceName] = useState<string | null>(null);
  const deferredSearchText = useDeferredValue(filters.searchText);
  const effectiveFilters = {
    ...filters,
    searchText: deferredSearchText
  };

  const { listData, detailData, loadingList, loadingDetail, listError, detailError, refresh } = usePurchaseInvoiceData({
    filters: effectiveFilters,
    page,
    selectedInvoiceName
  });

  useEffect(() => {
    if (!listData || listData.items.length === 0) {
      setSelectedInvoiceName(null);
      return;
    }

    if (!selectedInvoiceName || !listData.items.some((row) => row.invoiceNo === selectedInvoiceName)) {
      setSelectedInvoiceName(listData.items[0].invoiceNo);
    }
  }, [listData, selectedInvoiceName]);

  return (
    <div className="purchase-invoice-stack">
      <PurchaseInvoiceFilters
        filters={filters}
        supplierOptions={listData?.supplierOptions ?? []}
        loading={loadingList}
        onFiltersChange={(next) => {
          startTransition(() => {
            setFilters(next);
            setPage(1);
          });
        }}
        onRefresh={refresh}
      />

      {listError ? <p className="purchase-invoice-empty-state purchase-invoice-empty-state--error">{listError}</p> : null}
      {loadingList ? <p className="purchase-invoice-empty-state">Alis faturasi verisi yukleniyor...</p> : null}

      {!loadingList && !listError && listData ? (
        <>
          <PurchaseInvoiceSummaryCards summary={listData.summary} />

          <div className="purchase-invoice-pagination" role="group" aria-label="Alis faturasi sayfalama">
            <button
              type="button"
              onClick={() => {
                setPage((previous) => Math.max(1, previous - 1));
              }}
              disabled={page <= 1}
            >
              Onceki sayfa
            </button>
            <span>Sayfa {listData.page}</span>
            <button
              type="button"
              onClick={() => {
                setPage((previous) => previous + 1);
              }}
              disabled={!listData.hasNextPage}
            >
              Sonraki sayfa
            </button>
          </div>

          <div className="purchase-invoice-layout">
            <div className="purchase-invoice-list-block">
              <div className="purchase-invoice-mobile-only">
                <PurchaseInvoiceCardList
                  rows={listData.items}
                  selectedInvoiceName={selectedInvoiceName}
                  onSelect={setSelectedInvoiceName}
                />
              </div>
              <div className="purchase-invoice-desktop-only">
                <PurchaseInvoiceTable
                  rows={listData.items}
                  selectedInvoiceName={selectedInvoiceName}
                  onSelect={setSelectedInvoiceName}
                />
              </div>
            </div>

            <PurchaseInvoiceDetailPanel detail={detailData} loading={loadingDetail} error={detailError} />
          </div>
        </>
      ) : null}
    </div>
  );
}
