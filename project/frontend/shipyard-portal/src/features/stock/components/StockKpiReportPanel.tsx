import type { StockKpiSummary } from "../types";

type StockKpiReportPanelProps = {
  data: StockKpiSummary | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export function StockKpiReportPanel({ data, loading, error, onRefresh }: StockKpiReportPanelProps) {
  return (
    <section className="stock-panel stock-panel--kpi" aria-label="Stock KPI ve rapor paneli">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Stock KPI ve Rapor Paneli</h3>
          <p>Toplam stok resmi, kritik deger etkisi, depo dagilimi ve donemsel hareket trendini sunar.</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading}>
          Yenile
        </button>
      </div>

      {error ? <p className="stock-empty-state stock-empty-state--error">{error}</p> : null}
      {loading ? <p className="stock-empty-state">Stock KPI verisi yukleniyor...</p> : null}
      {!loading && !error && data && !data.canRead ? (
        <p className="stock-empty-state">Bu tenant'ta KPI panelini olusturacak okuma verisi bulunmuyor.</p>
      ) : null}

      {!loading && !error && data && data.canRead ? (
        <>
          <div className="stock-reconciliation-summary">
            <article>
              <span>Toplam urun</span>
              <strong>{data.totalItems}</strong>
            </article>
            <article>
              <span>Kritik urun</span>
              <strong>{data.criticalItems}</strong>
            </article>
            <article>
              <span>Dusuk stok deger etkisi</span>
              <strong>{data.lowStockValueImpactLabel}</strong>
            </article>
            <article>
              <span>Depo dagilim lideri</span>
              <strong>{data.topWarehouseName}</strong>
              <div className="stock-audit-status-note">{data.topWarehouseShareLabel}</div>
            </article>
          </div>

          {data.trend.length === 0 ? (
            <p className="stock-empty-state">{data.trendWindowLabel} icin hareket trendi verisi bulunmuyor.</p>
          ) : (
            <div className="stock-reconciliation-table-wrap">
              <table className="stock-reconciliation-table">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Hareket Hacmi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.trend.slice(-10).reverse().map((point) => (
                    <tr key={point.date}>
                      <td>{point.date}</td>
                      <td>{point.movementLabel}</td>
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
