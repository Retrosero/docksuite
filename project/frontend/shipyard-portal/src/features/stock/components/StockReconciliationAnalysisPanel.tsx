import type { StockReconciliationAnalysis } from "../types";

type StockReconciliationAnalysisPanelProps = {
  data: StockReconciliationAnalysis | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export function StockReconciliationAnalysisPanel({ data, loading, error, onRefresh }: StockReconciliationAnalysisPanelProps) {
  return (
    <section className="stock-panel stock-panel--reconciliation" aria-label="Sayim fark analizi">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Sayim Fark Analizi</h3>
          <p>Son sayim hareketlerinde stok farklarini ve riskli satirlari ozetler.</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading}>
          Yenile
        </button>
      </div>

      {error ? <p className="stock-empty-state stock-empty-state--error">{error}</p> : null}
      {loading ? <p className="stock-empty-state">Sayim fark analizi yukleniyor...</p> : null}
      {!loading && !error && data && !data.canRead ? (
        <p className="stock-empty-state">Bu tenant'ta Stock Reconciliation okuma yetkisi bulunmuyor.</p>
      ) : null}

      {!loading && !error && data && data.canRead ? (
        <>
          <div className="stock-reconciliation-summary">
            <article>
              <span>Toplam fark hacmi</span>
              <strong>{data.totalAbsDifferenceLabel}</strong>
            </article>
            <article>
              <span>Yuksek fark satiri</span>
              <strong>{data.criticalDifferenceCount}</strong>
            </article>
            <article>
              <span>Depo sayisi</span>
              <strong>{data.warehouseCount}</strong>
            </article>
            <article>
              <span>Analiz satiri</span>
              <strong>{data.totalRows}</strong>
            </article>
          </div>

          {data.statusSummary.length > 0 ? (
            <div className="stock-reconciliation-status-list" aria-label="Durum dagilimi">
              {data.statusSummary.map((status) => (
                <span key={status.label} className="stock-op-badge">
                  {status.label}: {status.count}
                </span>
              ))}
            </div>
          ) : null}

          {data.rows.length === 0 ? (
            <p className="stock-empty-state">Son sayim kayitlarinda analiz edilecek fark bulunmuyor.</p>
          ) : (
            <div className="stock-reconciliation-table-wrap">
              <table className="stock-reconciliation-table">
                <thead>
                  <tr>
                    <th>Belge</th>
                    <th>Tarih</th>
                    <th>Urun</th>
                    <th>Depo</th>
                    <th>Fark</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={`${row.reconciliationId}-${row.itemCode}-${row.warehouse}`}>
                      <td>{row.reconciliationId}</td>
                      <td>{row.postingDate}</td>
                      <td>{row.itemCode}</td>
                      <td>{row.warehouse}</td>
                      <td>{row.qtyDifferenceLabel}</td>
                      <td>{row.docStatusLabel}</td>
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
