import type { StockProcurementLinkSummary } from "../types";

type StockProcurementLinkPanelProps = {
  data: StockProcurementLinkSummary | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export function StockProcurementLinkPanel({ data, loading, error, onRefresh }: StockProcurementLinkPanelProps) {
  return (
    <section className="stock-panel stock-panel--procurement" aria-label="Procurement baglanti ozeti">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Procurement Baglanti Gorunumu</h3>
          <p>Kritik kalemler icin acik talep, acik siparis, receipt ve son fatura baglantisini gosterir.</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading}>
          Yenile
        </button>
      </div>

      {error ? <p className="stock-empty-state stock-empty-state--error">{error}</p> : null}
      {loading ? <p className="stock-empty-state">Procurement ozeti yukleniyor...</p> : null}
      {!loading && !error && data && !data.canRead ? (
        <p className="stock-empty-state">Bu tenant'ta procurement baglanti ozetini olusturacak okuma yetkisi bulunmuyor.</p>
      ) : null}

      {!loading && !error && data && data.canRead ? (
        <>
          <div className="stock-reconciliation-summary">
            <article>
              <span>Takip edilen kritik urun</span>
              <strong>{data.totalTrackedItems}</strong>
            </article>
            <article>
              <span>Acik talep</span>
              <strong>{data.totalOpenMaterialRequests}</strong>
            </article>
            <article>
              <span>Acik siparis</span>
              <strong>{data.totalOpenPurchaseOrders}</strong>
            </article>
            <article>
              <span>Toplam receipt</span>
              <strong>{data.totalReceipts}</strong>
            </article>
          </div>

          {data.rows.length === 0 ? (
            <p className="stock-empty-state">Kritik stok kalemi bulunmuyor; procurement baglanti listesi bos.</p>
          ) : (
            <div className="stock-reconciliation-table-wrap">
              <table className="stock-reconciliation-table">
                <thead>
                  <tr>
                    <th>Urun</th>
                    <th>Acik Talep</th>
                    <th>Acik Siparis</th>
                    <th>Receipt</th>
                    <th>Son Fatura</th>
                    <th>Fatura Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.itemCode}>
                      <td>
                        <strong>{row.itemCode}</strong>
                        <div className="stock-audit-status-note">{row.itemName}</div>
                      </td>
                      <td>{row.openMaterialRequestCount}</td>
                      <td>{row.openPurchaseOrderCount}</td>
                      <td>{row.purchaseReceiptCount}</td>
                      <td>{row.lastPurchaseInvoiceId ?? "-"}</td>
                      <td>{row.lastPurchaseInvoiceDate ?? "-"}</td>
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
