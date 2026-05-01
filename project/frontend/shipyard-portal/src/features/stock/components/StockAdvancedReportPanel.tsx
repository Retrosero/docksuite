import { buildStockAdvancedReportSummary } from "../services/stockService";
import type {
  StockAuditSummary,
  StockItem,
  StockKpiSummary,
  StockProcurementLinkSummary,
  StockReconciliationAnalysis
} from "../types";

type StockAdvancedReportPanelProps = {
  items: StockItem[];
  procurementSummary: StockProcurementLinkSummary | null;
  kpiSummary: StockKpiSummary | null;
  reconciliationSummary: StockReconciliationAnalysis | null;
  auditSummary: StockAuditSummary | null;
};

export function StockAdvancedReportPanel({
  items,
  procurementSummary,
  kpiSummary,
  reconciliationSummary,
  auditSummary
}: StockAdvancedReportPanelProps) {
  const report = buildStockAdvancedReportSummary({
    items,
    procurementSummary,
    kpiSummary,
    reconciliationSummary
  });

  return (
    <section className="stock-panel stock-panel--kpi" aria-label="Stok ileri raporlama paneli">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Stok Ileri Raporlama</h3>
          <p>Yaslanma, hareket sapmasi ve acik risk satirlarini tek panelde sunar.</p>
        </div>
      </div>

      <div className="stock-reconciliation-summary">
        <article>
          <span>Yaslanma 0-30</span>
          <strong>{report.agingBucket0To30}</strong>
        </article>
        <article>
          <span>Yaslanma 31-90</span>
          <strong>{report.agingBucket31To90}</strong>
        </article>
        <article>
          <span>Yaslanma 90+</span>
          <strong>{report.agingBucket90Plus}</strong>
        </article>
        <article>
          <span>Hareket sapmasi</span>
          <strong>{report.movementDeviationLabel}</strong>
          <div className="stock-audit-status-note">
            {report.movementDeviationDirection === "up"
              ? "Son hareket ortalamanin ustunde"
              : report.movementDeviationDirection === "down"
                ? "Son hareket ortalamanin altinda"
                : "Son hareket ortalamaya yakin"}
          </div>
        </article>
      </div>

      <div className="stock-reconciliation-summary">
        <article>
          <span>Acik risk toplam</span>
          <strong>{report.openRiskCount}</strong>
        </article>
        <article>
          <span>Yaslanma bilinmiyor</span>
          <strong>{report.agingUnknown}</strong>
        </article>
        <article>
          <span>Audit acik islem</span>
          <strong>{auditSummary?.openEvents ?? 0}</strong>
        </article>
        <article>
          <span>Drill-down satir</span>
          <strong>{report.drilldownRows.length}</strong>
        </article>
      </div>

      {report.drilldownRows.length === 0 ? (
        <p className="stock-empty-state">Drill-down icin kritik/yaklasan risk satiri bulunmuyor.</p>
      ) : (
        <div className="stock-reconciliation-table-wrap">
          <table className="stock-reconciliation-table">
            <thead>
              <tr>
                <th>Urun</th>
                <th>Risk</th>
                <th>Stok</th>
                <th>Acik Talep</th>
                <th>Acik Siparis</th>
                <th>Oneri</th>
              </tr>
            </thead>
            <tbody>
              {report.drilldownRows.map((row) => (
                <tr key={row.itemCode}>
                  <td>
                    <strong>{row.itemCode}</strong>
                    <div className="stock-audit-status-note">{row.itemName}</div>
                  </td>
                  <td>{row.riskLabel}</td>
                  <td>{row.stockQtyLabel}</td>
                  <td>{row.openMaterialRequestCount}</td>
                  <td>{row.openPurchaseOrderCount}</td>
                  <td>{row.suggestedActionLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
