import type { StockItem } from "../types";

type StockTableProps = {
  rows: StockItem[];
  hasCriticalField: boolean;
};

export function StockTable({ rows, hasCriticalField }: StockTableProps) {
  if (rows.length === 0) {
    return <p className="stock-empty-state">Filtreye uygun stok kaydi bulunamadi.</p>;
  }

  return (
    <section className="stock-table-wrap" aria-label="Stok tablo gorunumu">
      <table className="stock-table">
        <thead>
          <tr>
            <th>Barkod</th>
            <th>Urun</th>
            <th>Urun grubu</th>
            <th>2. Reyon</th>
            <th>Stok ozeti</th>
            {hasCriticalField ? <th>Kritik</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.barcode ?? "-"}</td>
              <td>
                <strong>{row.itemName}</strong>
                <span>{row.itemCode}</span>
              </td>
              <td>{row.itemGroup}</td>
              <td>{row.secondaryAisle ?? "-"}</td>
              <td>{row.stockQtyLabel}</td>
              {hasCriticalField ? (
                <td>
                  {row.isCritical ? <span className="stock-badge stock-badge--critical">Kritik</span> : <span className="stock-badge">Normal</span>}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
