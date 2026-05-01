import { Suspense, lazy, startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import {
  useStockAuditSummary,
  useStockData,
  useStockKpiSummary,
  useStockProcurementLinks,
  useStockReconciliationAnalysis,
  useStockTenantHealthSummary
} from "../hooks/useStockData";
import type { StockFilterState } from "../types";
import { StockAlertCenterPanel } from "./StockAlertCenterPanel";
import { StockCardList } from "./StockCardList";
import { StockFilters } from "./StockFilters";
import { StockMaterialRequestQuickCreate } from "./StockMaterialRequestQuickCreate";
import { StockReconciliationQuickCreate } from "./StockReconciliationQuickCreate";
import { StockExportPanel } from "./StockExportPanel";
import { StockPerformanceMetricsPanel } from "./StockPerformanceMetricsPanel";
import { StockSummaryCards } from "./StockSummaryCards";
import { StockTable } from "./StockTable";
import { StockTransferQuickCreate } from "./StockTransferQuickCreate";
import { StockWarehouseCards } from "./StockWarehouseCards";
import { buildStockAdvancedReportSummary } from "../services/stockService";

const StockReconciliationAnalysisPanel = lazy(() =>
  import("./StockReconciliationAnalysisPanel").then((module) => ({ default: module.StockReconciliationAnalysisPanel }))
);
const StockProcurementLinkPanel = lazy(() =>
  import("./StockProcurementLinkPanel").then((module) => ({ default: module.StockProcurementLinkPanel }))
);
const StockProcurementWorkflowPanel = lazy(() =>
  import("./StockProcurementWorkflowPanel").then((module) => ({ default: module.StockProcurementWorkflowPanel }))
);
const StockAdvancedReportPanel = lazy(() =>
  import("./StockAdvancedReportPanel").then((module) => ({ default: module.StockAdvancedReportPanel }))
);
const StockKpiReportPanel = lazy(() =>
  import("./StockKpiReportPanel").then((module) => ({ default: module.StockKpiReportPanel }))
);
const StockAuditSummaryPanel = lazy(() =>
  import("./StockAuditSummaryPanel").then((module) => ({ default: module.StockAuditSummaryPanel }))
);
const StockRolloutChecklistPanel = lazy(() =>
  import("./StockRolloutChecklistPanel").then((module) => ({ default: module.StockRolloutChecklistPanel }))
);
const StockTenantOperationsPanel = lazy(() =>
  import("./StockTenantOperationsPanel").then((module) => ({ default: module.StockTenantOperationsPanel }))
);
const StockAlertActionEventPanel = lazy(() =>
  import("./StockAlertActionEventPanel").then((module) => ({ default: module.StockAlertActionEventPanel }))
);
const StockTenantComparisonPanel = lazy(() =>
  import("./StockTenantComparisonPanel").then((module) => ({ default: module.StockTenantComparisonPanel }))
);

const INITIAL_FILTERS: StockFilterState = {
  itemGroup: "",
  searchText: "",
  criticalOnly: false
};

const STOCK_SMOKE_DOC_PATH = "project/docs/erpnext/project-usage/stock-rol-bazli-smoke-checklist.md";

export function StockScreen() {
  const [filters, setFilters] = useState<StockFilterState>(INITIAL_FILTERS);
  const [detailPanelsEnabled, setDetailPanelsEnabled] = useState(false);
  const [selectedItemCode, setSelectedItemCode] = useState("");
  const [selectedReconciliationSeed, setSelectedReconciliationSeed] = useState<{
    itemCode: string;
    warehouse: string;
    countedQty: number;
  } | null>(null);
  const baseLoadStartRef = useRef<number | null>(null);
  const reconciliationLoadStartRef = useRef<number | null>(null);
  const procurementLoadStartRef = useRef<number | null>(null);
  const kpiLoadStartRef = useRef<number | null>(null);
  const auditLoadStartRef = useRef<number | null>(null);
  const [baseLoadMs, setBaseLoadMs] = useState<number | null>(null);
  const [reconciliationLoadMs, setReconciliationLoadMs] = useState<number | null>(null);
  const [procurementLoadMs, setProcurementLoadMs] = useState<number | null>(null);
  const [kpiLoadMs, setKpiLoadMs] = useState<number | null>(null);
  const [auditLoadMs, setAuditLoadMs] = useState<number | null>(null);
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
  const { data: tenantHealthData, refresh: refreshTenantHealth } = useStockTenantHealthSummary({
    enabled: detailPanelsEnabled
  });
  const advancedReportSummary =
    detailPanelsEnabled && data
      ? buildStockAdvancedReportSummary({
          items: data.items,
          procurementSummary: procurementData,
          kpiSummary: kpiData,
          reconciliationSummary: reconciliationData
        })
      : null;
  const detailPanelError = reconciliationError || procurementError || kpiError || auditError;

  useEffect(() => {
    if (loading) {
      if (baseLoadStartRef.current === null) {
        baseLoadStartRef.current = performance.now();
      }
      return;
    }
    if (baseLoadStartRef.current !== null) {
      setBaseLoadMs(Math.round(performance.now() - baseLoadStartRef.current));
      baseLoadStartRef.current = null;
    }
  }, [loading]);

  useEffect(() => {
    if (!detailPanelsEnabled) return;
    if (reconciliationLoading) {
      if (reconciliationLoadStartRef.current === null) reconciliationLoadStartRef.current = performance.now();
      return;
    }
    if (reconciliationLoadStartRef.current !== null) {
      setReconciliationLoadMs(Math.round(performance.now() - reconciliationLoadStartRef.current));
      reconciliationLoadStartRef.current = null;
    }
  }, [detailPanelsEnabled, reconciliationLoading]);

  useEffect(() => {
    if (!detailPanelsEnabled) return;
    if (procurementLoading) {
      if (procurementLoadStartRef.current === null) procurementLoadStartRef.current = performance.now();
      return;
    }
    if (procurementLoadStartRef.current !== null) {
      setProcurementLoadMs(Math.round(performance.now() - procurementLoadStartRef.current));
      procurementLoadStartRef.current = null;
    }
  }, [detailPanelsEnabled, procurementLoading]);

  useEffect(() => {
    if (!detailPanelsEnabled) return;
    if (kpiLoading) {
      if (kpiLoadStartRef.current === null) kpiLoadStartRef.current = performance.now();
      return;
    }
    if (kpiLoadStartRef.current !== null) {
      setKpiLoadMs(Math.round(performance.now() - kpiLoadStartRef.current));
      kpiLoadStartRef.current = null;
    }
  }, [detailPanelsEnabled, kpiLoading]);

  useEffect(() => {
    if (!detailPanelsEnabled) return;
    if (auditLoading) {
      if (auditLoadStartRef.current === null) auditLoadStartRef.current = performance.now();
      return;
    }
    if (auditLoadStartRef.current !== null) {
      setAuditLoadMs(Math.round(performance.now() - auditLoadStartRef.current));
      auditLoadStartRef.current = null;
    }
  }, [detailPanelsEnabled, auditLoading]);

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
      <section className="stock-panel stock-panel--kpi" aria-label="Stok kullanim rehberi">
        <div className="stock-reconciliation-header">
          <div>
            <h3>Kisa Kullanim Rehberi</h3>
            <p>Akis: Filtrele, talep/transfer, detay panelleri, KPI/Audit ve export.</p>
          </div>
        </div>
        <ul className="stock-help-list">
          <li>Depo sorumlusu: kritik stok ve transfer akisini once kontrol et.</li>
          <li>Formen: uyari merkezinden hizli talep olustur, procurement panelinden takip et.</li>
          <li>Yonetici: KPI, audit ve export ciktilarini birlikte dogrula.</li>
        </ul>
        <p className="stock-help-docline">Detay rehber: {STOCK_SMOKE_DOC_PATH}</p>
        {error ? <p className="stock-empty-state stock-empty-state--error">Sorun cozum adimlari icin rol-bazli smoke checklist dokumanini acin.</p> : null}
        {detailPanelError ? (
          <p className="stock-empty-state stock-empty-state--error">
            Detay panel hatasi algilandi. Yetki/API dogrulamasi icin rol-bazli smoke checklist'i kullanin.
          </p>
        ) : null}
      </section>

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
              refreshTenantHealth();
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
              refreshTenantHealth();
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
            <Suspense fallback={<p className="stock-empty-state">Detay panelleri yukleniyor...</p>}>
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
                <StockTenantOperationsPanel
                  items={data.items}
                  procurementData={procurementData}
                  reconciliationData={reconciliationData}
                  auditData={auditData}
                  procurementError={procurementError}
                  reconciliationError={reconciliationError}
                  auditError={auditError}
                  healthSummary={tenantHealthData}
                />
                <StockAlertActionEventPanel
                  procurementSummary={procurementData}
                  auditSummary={auditData}
                  reconciliationSummary={reconciliationData}
                />
                <StockTenantComparisonPanel
                  items={data.items}
                  procurementSummary={procurementData}
                  kpiSummary={kpiData}
                  reconciliationSummary={reconciliationData}
                  auditSummary={auditData}
                />
                <StockPerformanceMetricsPanel
                  baseLoadMs={baseLoadMs}
                  reconciliationLoadMs={reconciliationLoadMs}
                  procurementLoadMs={procurementLoadMs}
                  kpiLoadMs={kpiLoadMs}
                  auditLoadMs={auditLoadMs}
                />
                <StockExportPanel
                  items={data.items}
                  reconciliationData={reconciliationData}
                  procurementData={procurementData}
                  kpiData={kpiData}
                  auditData={auditData}
                  advancedReport={advancedReportSummary}
                />
              </>
            </Suspense>
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
              refreshTenantHealth();
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
