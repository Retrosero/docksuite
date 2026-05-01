import { buildStockAlertActionEventSummary } from "../services/stockService";
import type { StockAuditSummary, StockProcurementLinkSummary, StockReconciliationAnalysis } from "../types";

type StockAlertActionEventPanelProps = {
  procurementSummary: StockProcurementLinkSummary | null;
  auditSummary: StockAuditSummary | null;
  reconciliationSummary: StockReconciliationAnalysis | null;
};

function toToneClass(tone: "success" | "warning" | "critical") {
  if (tone === "critical") return "stock-badge stock-badge--critical";
  if (tone === "warning") return "stock-badge stock-badge--warning";
  return "stock-badge";
}

export function StockAlertActionEventPanel({
  procurementSummary,
  auditSummary,
  reconciliationSummary
}: StockAlertActionEventPanelProps) {
  const summary = buildStockAlertActionEventSummary({
    procurementSummary,
    auditSummary,
    reconciliationSummary
  });

  return (
    <section className="stock-panel stock-panel--procurement" aria-label="Alert aksiyon event paneli">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Alert Aksiyon Event Kaydi</h3>
          <p>Alarm tetikleyici, onerilen aksiyon ve sonuc durumu tenant bazli izlenir.</p>
        </div>
      </div>
      <div className="stock-reconciliation-summary">
        <article>
          <span>Toplam event</span>
          <strong>{summary.totalEvents}</strong>
        </article>
        <article>
          <span>Basarili</span>
          <strong>{summary.successCount}</strong>
        </article>
        <article>
          <span>Uyari</span>
          <strong>{summary.warningCount}</strong>
        </article>
        <article>
          <span>Kritik</span>
          <strong>{summary.criticalCount}</strong>
        </article>
      </div>
      {summary.rows.length === 0 ? (
        <p className="stock-empty-state">Event modeli icin procurement workflow kaydi bulunmuyor.</p>
      ) : (
        <div className="stock-reconciliation-table-wrap">
          <table className="stock-reconciliation-table">
            <thead>
              <tr>
                <th>Urun</th>
                <th>Tetikleyici</th>
                <th>Aksiyon</th>
                <th>Sonuc</th>
                <th>Zaman</th>
              </tr>
            </thead>
            <tbody>
              {summary.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.itemCode}</strong>
                    <div className="stock-audit-status-note">{row.itemName}</div>
                  </td>
                  <td>{row.triggerLabel}</td>
                  <td>{row.actionLabel}</td>
                  <td>
                    <span className={toToneClass(row.resultTone)}>{row.resultLabel}</span>
                  </td>
                  <td>{row.eventTimeLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
