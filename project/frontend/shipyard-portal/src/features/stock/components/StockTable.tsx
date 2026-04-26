import type { StockItem } from "../types";

type StockTableProps = {
  rows: StockItem[];
  hasCriticalField: boolean;
  onQuickRequest: (itemCode: string) => void;
};

export function StockTable({ rows, hasCriticalField, onQuickRequest }: StockTableProps) {
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
            <th>Islem</th>
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
                  {row.riskLevel === "critical" ? <span className="stock-badge stock-badge--critical">Kritik</span> : null}
                  {row.riskLevel === "warning" ? <span className="stock-badge stock-badge--warning">Yaklasan</span> : null}
                  {row.riskLevel === "normal" ? <span className="stock-badge">Normal</span> : null}
                  {row.riskLevel === "unknown" ? <span className="stock-badge">Bilinmiyor</span> : null}
                </td>
              ) : null}
              <td>
                <button
                  type="button"
                  className="stock-request-trigger"
                  onClick={() => {
                    onQuickRequest(row.itemCode);
                  }}
                >
                  Talep Ac
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
