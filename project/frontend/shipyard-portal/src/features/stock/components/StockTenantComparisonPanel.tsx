import {
  buildStockAdvancedReportSummary,
  buildStockAlertActionEventSummary,
  buildStockTenantComparisonSummary
} from "../services/stockService";
import type {
  StockAuditSummary,
  StockItem,
  StockKpiSummary,
  StockProcurementLinkSummary,
  StockReconciliationAnalysis
} from "../types";

type StockTenantComparisonPanelProps = {
  items: StockItem[];
  procurementSummary: StockProcurementLinkSummary | null;
  kpiSummary: StockKpiSummary | null;
  reconciliationSummary: StockReconciliationAnalysis | null;
  auditSummary: StockAuditSummary | null;
};

function toToneClass(tone: "success" | "warning" | "critical") {
  if (tone === "critical") return "stock-badge stock-badge--critical";
  if (tone === "warning") return "stock-badge stock-badge--warning";
  return "stock-badge";
}

export function StockTenantComparisonPanel({
  items,
  procurementSummary,
  kpiSummary,
  reconciliationSummary,
  auditSummary
}: StockTenantComparisonPanelProps) {
  const advanced = buildStockAdvancedReportSummary({
    items,
    procurementSummary,
    kpiSummary,
    reconciliationSummary
  });
  const eventSummary = buildStockAlertActionEventSummary({
    procurementSummary,
    auditSummary,
    reconciliationSummary
  });
  const comparison = buildStockTenantComparisonSummary({
    kpiSummary,
    advancedSummary: advanced,
    alertEventSummary: eventSummary
  });

  return (
    <section className="stock-panel stock-panel--kpi" aria-label="Tenant karsilastirmali rapor paneli">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Tenant Karsilastirmali Rapor</h3>
          <p>Mevcut tenant performansi benchmark seviyeleriyle karsilastirilir.</p>
        </div>
      </div>
      <div className="stock-reconciliation-summary">
        <article>
          <span>Trend skoru</span>
          <strong>{comparison.trendScoreLabel}</strong>
        </article>
        <article>
          <span>Incident yogunlugu</span>
          <strong>{comparison.incidentDensityLabel}</strong>
        </article>
        <article>
          <span>Acik risk</span>
          <strong>{comparison.openRiskLabel}</strong>
        </article>
      </div>
      <div className="stock-reconciliation-table-wrap">
        <table className="stock-reconciliation-table">
          <thead>
            <tr>
              <th>Metrik</th>
              <th>Tenant</th>
              <th>Benchmark</th>
              <th>Fark</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row) => (
              <tr key={row.metricLabel}>
                <td>{row.metricLabel}</td>
                <td>{row.currentTenantLabel}</td>
                <td>{row.benchmarkLabel}</td>
                <td>{row.deltaLabel}</td>
                <td>
                  <span className={toToneClass(row.tone)}>
                    {row.tone === "success" ? "Iyi" : row.tone === "warning" ? "Izle" : "Risk"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
