import { buildStockProcurementWorkflowSummary } from "../services/stockService";
import type { StockProcurementLinkSummary, StockProcurementWorkflowRow } from "../types";

type StockProcurementWorkflowPanelProps = {
  procurementSummary: StockProcurementLinkSummary | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onQuickRequest: (itemCode: string) => void;
  onQuickTransfer: (itemCode: string) => void;
};

function toToneClass(row: StockProcurementWorkflowRow) {
  if (row.stageTone === "critical") return "stock-badge stock-badge--critical";
  if (row.stageTone === "warning") return "stock-badge stock-badge--warning";
  return "stock-badge";
}

export function StockProcurementWorkflowPanel({
  procurementSummary,
  loading,
  error,
  onRefresh,
  onQuickRequest,
  onQuickTransfer
}: StockProcurementWorkflowPanelProps) {
  const workflow = procurementSummary ? buildStockProcurementWorkflowSummary(procurementSummary) : null;

  return (
    <section className="stock-panel stock-panel--procurement" aria-label="Procurement aksiyon workflow">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Procurement Aksiyon Workflow</h3>
          <p>Talep, siparis, teslimat ve fatura gecislerini risk onceligine gore takip eder.</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading}>
          Yenile
        </button>
      </div>

      {error ? <p className="stock-empty-state stock-empty-state--error">{error}</p> : null}
      {loading ? <p className="stock-empty-state">Workflow ozeti yukleniyor...</p> : null}
      {!loading && !error && workflow && !workflow.canRead ? (
        <p className="stock-empty-state">Bu tenant'ta procurement workflow ozetini olusturacak okuma yetkisi bulunmuyor.</p>
      ) : null}

      {!loading && !error && workflow && workflow.canRead ? (
        <>
          <div className="stock-reconciliation-summary">
            <article>
              <span>Talep bekleyen</span>
              <strong>{workflow.requestPendingCount}</strong>
            </article>
            <article>
              <span>Talep acik</span>
              <strong>{workflow.requestOpenCount}</strong>
            </article>
            <article>
              <span>Siparis acik</span>
              <strong>{workflow.poOpenCount}</strong>
            </article>
            <article>
              <span>Faturalanan</span>
              <strong>{workflow.invoicedCount}</strong>
            </article>
          </div>

          {workflow.rows.length === 0 ? (
            <p className="stock-empty-state">Workflow'ta izlenecek kritik stok kalemi bulunmuyor.</p>
          ) : (
            <div className="stock-reconciliation-table-wrap">
              <table className="stock-reconciliation-table">
                <thead>
                  <tr>
                    <th>Urun</th>
                    <th>Faz</th>
                    <th>Talep</th>
                    <th>Siparis</th>
                    <th>Receipt</th>
                    <th>Oneri</th>
                    <th>Hizli Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {workflow.rows.map((row) => (
                    <tr key={row.itemCode}>
                      <td>
                        <strong>{row.itemCode}</strong>
                        <div className="stock-audit-status-note">{row.itemName}</div>
                      </td>
                      <td>
                        <span className={toToneClass(row)}>{row.stageLabel}</span>
                      </td>
                      <td>{row.openMaterialRequestCount}</td>
                      <td>{row.openPurchaseOrderCount}</td>
                      <td>{row.purchaseReceiptCount}</td>
                      <td>{row.suggestedActionLabel}</td>
                      <td>
                        <div className="stock-action-buttons">
                          <button type="button" onClick={() => onQuickRequest(row.itemCode)}>
                            Talep
                          </button>
                          <button type="button" onClick={() => onQuickTransfer(row.itemCode)}>
                            Transfer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
