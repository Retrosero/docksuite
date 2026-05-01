type StockPerformanceMetricsPanelProps = {
  baseLoadMs: number | null;
  reconciliationLoadMs: number | null;
  procurementLoadMs: number | null;
  kpiLoadMs: number | null;
  auditLoadMs: number | null;
};

function toMsLabel(value: number | null) {
  if (value === null) {
    return "-";
  }
  return `${value} ms`;
}

export function StockPerformanceMetricsPanel({
  baseLoadMs,
  reconciliationLoadMs,
  procurementLoadMs,
  kpiLoadMs,
  auditLoadMs
}: StockPerformanceMetricsPanelProps) {
  return (
    <section className="stock-panel stock-panel--kpi" aria-label="Performans olcum paneli">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Performans Olcum Paneli</h3>
          <p>Ilk veri yukleme ve detay panel sorgu surelerini gosteren canli metrik ozetidir.</p>
        </div>
      </div>

      <div className="stock-reconciliation-summary">
        <article>
          <span>Temel stok yukleme</span>
          <strong>{toMsLabel(baseLoadMs)}</strong>
        </article>
        <article>
          <span>Reconciliation panel</span>
          <strong>{toMsLabel(reconciliationLoadMs)}</strong>
        </article>
        <article>
          <span>Procurement panel</span>
          <strong>{toMsLabel(procurementLoadMs)}</strong>
        </article>
        <article>
          <span>KPI panel</span>
          <strong>{toMsLabel(kpiLoadMs)}</strong>
        </article>
      </div>

      <div className="stock-reconciliation-summary">
        <article>
          <span>Audit panel</span>
          <strong>{toMsLabel(auditLoadMs)}</strong>
        </article>
      </div>
    </section>
  );
}
