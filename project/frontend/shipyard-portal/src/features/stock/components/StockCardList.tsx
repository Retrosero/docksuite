import type { StockItem } from "../types";

type StockCardListProps = {
  rows: StockItem[];
  hasCriticalField: boolean;
  onQuickRequest: (itemCode: string) => void;
  onQuickTransfer: (itemCode: string) => void;
};

export function StockCardList({ rows, hasCriticalField, onQuickRequest, onQuickTransfer }: StockCardListProps) {
  if (rows.length === 0) {
    return <p className="stock-empty-state">Filtreye uygun stok kaydi bulunamadi.</p>;
  }

  return (
    <section className="stock-card-list" aria-label="Stok kart listesi">
      {rows.map((row) => (
        <article
          className={`stock-card${row.tone === "critical" ? " stock-card--critical" : ""}${
            row.tone === "warning" ? " stock-card--warning" : ""
          }`}
          key={row.id}
        >
          <div className="stock-card__top">
            <div>
              <strong>{row.itemName}</strong>
              <span>{row.itemCode}</span>
            </div>
            {row.riskLevel === "critical" ? <span className="stock-badge stock-badge--critical">Kritik</span> : null}
            {row.riskLevel === "warning" ? <span className="stock-badge stock-badge--warning">Yaklasan</span> : null}
            {!hasCriticalField && row.riskLevel === "unknown" ? <span className="stock-badge">Bilinmiyor</span> : null}
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
          <div className="stock-card__actions">
            <button
              type="button"
              className="stock-request-trigger"
              onClick={() => {
                onQuickRequest(row.itemCode);
              }}
            >
              Talep Ac
            </button>
            <button
              type="button"
              className="stock-transfer-trigger"
              onClick={() => {
                onQuickTransfer(row.itemCode);
              }}
            >
              Transfer Ac
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
