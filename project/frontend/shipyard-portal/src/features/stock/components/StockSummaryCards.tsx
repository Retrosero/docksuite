import type { StockSummary } from "../types";

type StockSummaryCardsProps = {
  summary: StockSummary;
};

export function StockSummaryCards({ summary }: StockSummaryCardsProps) {
  return (
    <section className="stock-summary-grid" aria-label="Stok ozet kartlari">
      <article>
        <span>Toplam urun</span>
        <strong>{summary.totalItems}</strong>
      </article>
      <article>
        <span>Kritik stok</span>
        <strong>{summary.totalCriticalItems}</strong>
      </article>
      <article>
        <span>Stok yok / eksi</span>
        <strong>{summary.noStockItems}</strong>
      </article>
      <article>
        <span>Barkodlu urun</span>
        <strong>{summary.withBarcodeItems}</strong>
      </article>
    </section>
  );
}
