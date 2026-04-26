import type { StockWarehouseDistribution } from "../types";

type StockWarehouseCardsProps = {
  rows: StockWarehouseDistribution[];
};

export function StockWarehouseCards({ rows }: StockWarehouseCardsProps) {
  if (rows.length === 0) {
    return <p className="stock-empty-state">Depo dagilim verisi bulunamadi.</p>;
  }

  return (
    <section className="stock-warehouse-grid" aria-label="Depo dagilim kartlari">
      {rows.map((row) => (
        <article key={row.warehouse} className="stock-warehouse-card">
          <div className="stock-warehouse-card__top">
            <strong>{row.warehouse}</strong>
            <span>%{row.sharePercent}</span>
          </div>
          <div className="stock-warehouse-card__metrics">
            <p>
              <span>Toplam stok</span>
              {row.totalQtyLabel}
            </p>
            <p>
              <span>Urun adedi</span>
              {row.itemCount}
            </p>
            <p>
              <span>Kritik urun</span>
              {row.criticalItemCount}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
