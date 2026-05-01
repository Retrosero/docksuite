import { startTransition, useDeferredValue, useState } from "react";
import {
  useStockAuditSummary,
  useStockData,
  useStockKpiSummary,
  useStockProcurementLinks,
  useStockReconciliationAnalysis
} from "../hooks/useStockData";
import { StockAuditSummaryPanel } from "./StockAuditSummaryPanel";
import { StockAdvancedReportPanel } from "./StockAdvancedReportPanel";
import type { StockFilterState } from "../types";
import { StockAlertCenterPanel } from "./StockAlertCenterPanel";
import { StockKpiReportPanel } from "./StockKpiReportPanel";
import { StockProcurementLinkPanel } from "./StockProcurementLinkPanel";
import { StockProcurementWorkflowPanel } from "./StockProcurementWorkflowPanel";
import { StockCardList } from "./StockCardList";
import { StockFilters } from "./StockFilters";
import { StockMaterialRequestQuickCreate } from "./StockMaterialRequestQuickCreate";
import { StockReconciliationAnalysisPanel } from "./StockReconciliationAnalysisPanel";
import { StockReconciliationQuickCreate } from "./StockReconciliationQuickCreate";
import { StockRolloutChecklistPanel } from "./StockRolloutChecklistPanel";
import { StockSummaryCards } from "./StockSummaryCards";
import { StockTable } from "./StockTable";
import { StockTransferQuickCreate } from "./StockTransferQuickCreate";
import { StockWarehouseCards } from "./StockWarehouseCards";

const INITIAL_FILTERS: StockFilterState = {
  itemGroup: "",
  searchText: "",
  criticalOnly: false
};

export function StockScreen() {
  const [filters, setFilters] = useState<StockFilterState>(INITIAL_FILTERS);
  const [detailPanelsEnabled, setDetailPanelsEnabled] = useState(false);
  const [selectedItemCode, setSelectedItemCode] = useState("");
  const [selectedReconciliationSeed, setSelectedReconciliationSeed] = useState<{
    itemCode: string;
    warehouse: string;
    countedQty: number;
  } | null>(null);
  const deferredSearchText = useDeferredValue(filters.searchText);
  const effectiveFilters = {
    ...filters,
    searchText: deferredSearchText
  };
  const { data, loading, error, refresh } = useStockData({
    filters: effectiveFilters
  });
  const {
    data: reconciliationData,
    loading: reconciliationLoading,
    error: reconciliationError,
    refresh: refreshReconciliation
  } = useStockReconciliationAnalysis({ enabled: detailPanelsEnabled });
  const {
    data: auditData,
    loading: auditLoading,
    error: auditError,
    refresh: refreshAudit
  } = useStockAuditSummary({ enabled: detailPanelsEnabled });
  const {
    data: procurementData,
    loading: procurementLoading,
    error: procurementError,
    refresh: refreshProcurement
  } = useStockProcurementLinks({
    itemRows: data?.items ?? [],
    enabled: detailPanelsEnabled
  });
  const {
    data: kpiData,
    loading: kpiLoading,
    error: kpiError,
    refresh: refreshKpi
  } = useStockKpiSummary({
    itemRows: data?.items ?? [],
    warehouseDistribution: data?.warehouseDistribution ?? [],
    enabled: detailPanelsEnabled
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
          <StockAlertCenterPanel
            items={data.items}
            onQuickRequest={(itemCode) => {
              setSelectedItemCode(itemCode);
            }}
            onQuickTransfer={(itemCode) => {
              setSelectedItemCode(itemCode);
            }}
          />
          <StockMaterialRequestQuickCreate
            items={data.items}
            selectedItemCode={selectedItemCode}
            onSelectedItemCodeChange={setSelectedItemCode}
            onCreated={() => {
              refresh();
              refreshReconciliation();
              refreshAudit();
              refreshProcurement();
              refreshKpi();
            }}
          />
          <StockTransferQuickCreate
            items={data.items}
            selectedItemCode={selectedItemCode}
            onSelectedItemCodeChange={setSelectedItemCode}
            onCreated={() => {
              refresh();
              refreshReconciliation();
              refreshAudit();
              refreshProcurement();
              refreshKpi();
            }}
          />
          {!detailPanelsEnabled ? (
            <section className="stock-panel stock-panel--kpi" aria-label="Detay panelleri">
              <div className="stock-reconciliation-header">
                <div>
                  <h3>Detay Panelleri</h3>
                  <p>Ilk yukleme performansi icin ileri paneller istege bagli acilir.</p>
                </div>
                <button type="button" onClick={() => setDetailPanelsEnabled(true)}>
                  Detay panelleri yukle
                </button>
              </div>
            </section>
          ) : (
            <>
              <StockReconciliationAnalysisPanel
                data={reconciliationData}
                loading={reconciliationLoading}
                error={reconciliationError}
                onRefresh={refreshReconciliation}
                onSelectRow={(payload) => {
                  setSelectedReconciliationSeed(payload);
                  setSelectedItemCode(payload.itemCode);
                }}
              />
              <StockProcurementLinkPanel
                data={procurementData}
                loading={procurementLoading}
                error={procurementError}
                onRefresh={refreshProcurement}
              />
              <StockProcurementWorkflowPanel
                procurementSummary={procurementData}
                loading={procurementLoading}
                error={procurementError}
                onRefresh={refreshProcurement}
                onQuickRequest={(itemCode) => {
                  setSelectedItemCode(itemCode);
                }}
                onQuickTransfer={(itemCode) => {
                  setSelectedItemCode(itemCode);
                }}
              />
              <StockAdvancedReportPanel
                items={data.items}
                procurementSummary={procurementData}
                kpiSummary={kpiData}
                reconciliationSummary={reconciliationData}
                auditSummary={auditData}
              />
              <StockKpiReportPanel data={kpiData} loading={kpiLoading} error={kpiError} onRefresh={refreshKpi} />
              <StockAuditSummaryPanel data={auditData} loading={auditLoading} error={auditError} onRefresh={refreshAudit} />
              <StockRolloutChecklistPanel
                items={data.items}
                procurementData={procurementData}
                reconciliationData={reconciliationData}
                kpiData={kpiData}
                auditData={auditData}
                procurementError={procurementError}
                reconciliationError={reconciliationError}
                kpiError={kpiError}
                auditError={auditError}
              />
            </>
          )}
          <StockReconciliationQuickCreate
            items={data.items}
            selectedItemCode={selectedItemCode}
            onSelectedItemCodeChange={setSelectedItemCode}
            selectedSeed={selectedReconciliationSeed}
            onCreated={() => {
              refresh();
              refreshReconciliation();
              refreshAudit();
              refreshProcurement();
              refreshKpi();
            }}
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
