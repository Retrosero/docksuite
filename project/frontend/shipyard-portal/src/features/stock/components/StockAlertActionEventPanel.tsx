import { useEffect, useMemo, useState } from "react";
import {
  buildStockAlertActionEventSummary,
  fetchPersistedStockAlertActionEvents,
  syncStockAlertActionEvents
} from "../services/stockService";
import type {
  StockAlertActionEventSummary,
  StockAuditSummary,
  StockProcurementLinkSummary,
  StockReconciliationAnalysis
} from "../types";

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
  const derivedSummary = useMemo(
    () =>
      buildStockAlertActionEventSummary({
        procurementSummary,
        auditSummary,
        reconciliationSummary
      }),
    [auditSummary, procurementSummary, reconciliationSummary]
  );
  const [persistedSummary, setPersistedSummary] = useState<StockAlertActionEventSummary | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function syncEvents() {
      setSyncError(null);
      try {
        if (derivedSummary.rows.length > 0) {
          await syncStockAlertActionEvents(derivedSummary.rows);
        }
        const response = await fetchPersistedStockAlertActionEvents(25);
        if (!cancelled) {
          setPersistedSummary(response);
        }
      } catch {
        if (!cancelled) {
          setSyncError("Kalici event kaydi su anda okunamadi; gecici ekran ozeti gosteriliyor.");
          setPersistedSummary(null);
        }
      }
    }

    void syncEvents();
    return () => {
      cancelled = true;
    };
  }, [derivedSummary]);

  const summary = persistedSummary ?? derivedSummary;

  return (
    <section className="stock-panel stock-panel--procurement" aria-label="Alert aksiyon event paneli">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Alert Aksiyon Event Kaydi</h3>
          <p>Alarm tetikleyici, onerilen aksiyon ve sonuc durumu tenant bazli kalici ERP kaydina alinir.</p>
        </div>
      </div>
      {syncError ? <p className="stock-help-docline">{syncError}</p> : null}
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
