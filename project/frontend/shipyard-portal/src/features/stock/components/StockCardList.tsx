import type { StockItem } from "../types";

type StockCardListProps = {
  rows: StockItem[];
  hasCriticalField: boolean;
};

export function StockCardList({ rows, hasCriticalField }: StockCardListProps) {
  if (rows.length === 0) {
    return <p className="stock-empty-state">Filtreye uygun stok kaydi bulunamadi.</p>;
  }

  return (
    <section className="stock-card-list" aria-label="Stok kart listesi">
      {rows.map((row) => (
        <article className={`stock-card${row.tone === "critical" ? " stock-card--critical" : ""}`} key={row.id}>
          <div className="stock-card__top">
            <div>
              <strong>{row.itemName}</strong>
              <span>{row.itemCode}</span>
            </div>
            {hasCriticalField && row.isCritical ? <span className="stock-badge stock-badge--critical">Kritik</span> : null}
          </div>

          <div className="stock-card__grid">
            <p>
              <span>Barkod</span>
              {row.barcode ?? "Barkod yok"}
            </p>
            <p>
              <span>Urun grubu</span>
              {row.itemGroup}
            </p>
            <p>
              <span>2. Reyon</span>
              {row.secondaryAisle ?? "Reyon bilgisi yok"}
            </p>
            <p>
              <span>Stok ozeti</span>
              {row.stockQtyLabel}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
