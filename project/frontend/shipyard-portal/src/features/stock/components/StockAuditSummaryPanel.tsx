import type { StockAuditSummary } from "../types";

type StockAuditSummaryPanelProps = {
  data: StockAuditSummary | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

function toStateBadgeClass(tone: "open" | "closed") {
  return tone === "closed" ? "stock-op-badge stock-op-badge--success" : "stock-op-badge stock-op-badge--loading";
}

export function StockAuditSummaryPanel({ data, loading, error, onRefresh }: StockAuditSummaryPanelProps) {
  return (
    <section className="stock-panel stock-panel--audit" aria-label="Stok audit ozeti">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Audit Iz Ozeti</h3>
          <p>Malzeme talebi, transfer ve sayim hareketlerinde acik/kapali akis kayitlarini gosterir.</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading}>
          Yenile
        </button>
      </div>

      {error ? <p className="stock-empty-state stock-empty-state--error">{error}</p> : null}
      {loading ? <p className="stock-empty-state">Audit ozeti yukleniyor...</p> : null}
      {!loading && !error && data && !data.canRead ? (
        <p className="stock-empty-state">Bu tenant'ta stok audit ozetini olusturacak okuma yetkisi bulunmuyor.</p>
      ) : null}

      {!loading && !error && data && data.canRead ? (
        <>
          <div className="stock-reconciliation-summary">
            <article>
              <span>Toplam kayit</span>
              <strong>{data.totalEvents}</strong>
            </article>
            <article>
              <span>Acik akis</span>
              <strong>{data.openEvents}</strong>
            </article>
            <article>
              <span>Kapali akis</span>
              <strong>{data.closedEvents}</strong>
            </article>
            <article>
              <span>Farkli islem sahibi</span>
              <strong>{data.uniqueActors}</strong>
            </article>
          </div>

          {data.doctypeSummary.length > 0 ? (
            <div className="stock-reconciliation-status-list" aria-label="Doctype dagilimi">
              {data.doctypeSummary.map((status) => (
                <span key={status.label} className="stock-op-badge">
                  {status.label}: {status.count}
                </span>
              ))}
            </div>
          ) : null}

          {data.rows.length === 0 ? (
            <p className="stock-empty-state">Son stok operasyonlarinda gosterilecek audit kaydi yok.</p>
          ) : (
            <div className="stock-reconciliation-table-wrap">
              <table className="stock-reconciliation-table">
                <thead>
                  <tr>
                    <th>Belge</th>
                    <th>Kaynak</th>
                    <th>Tarih</th>
                    <th>Durum</th>
                    <th>Docstatus</th>
                    <th>Sahip</th>
                    <th>Son guncelleme</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={`${row.doctype}-${row.documentId}`}>
                      <td>{row.documentId}</td>
                      <td>{row.doctype}</td>
                      <td>{row.postingDate}</td>
                      <td>
                        <span className={toStateBadgeClass(row.stateTone)}>{row.stateLabel}</span>
                        <div className="stock-audit-status-note">{row.statusLabel}</div>
                      </td>
                      <td>{row.docStatusLabel}</td>
                      <td>{row.actor}</td>
                      <td>{row.updatedAt.slice(0, 16)}</td>
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
