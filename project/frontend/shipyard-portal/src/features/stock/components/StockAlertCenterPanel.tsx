import type { StockItem } from "../types";

type StockAlertCenterPanelProps = {
  items: StockItem[];
};

function toRiskScore(value: StockItem["riskLevel"]) {
  if (value === "critical") {
    return 3;
  }
  if (value === "warning") {
    return 2;
  }
  if (value === "unknown") {
    return 1;
  }
  return 0;
}

function toRiskLabel(value: StockItem["riskLevel"]) {
  if (value === "critical") {
    return "Kritik";
  }
  if (value === "warning") {
    return "Yaklasan";
  }
  if (value === "unknown") {
    return "Bilinmiyor";
  }
  return "Normal";
}

function toRiskBadgeClass(value: StockItem["riskLevel"]) {
  if (value === "critical") {
    return "stock-badge stock-badge--critical";
  }
  if (value === "warning") {
    return "stock-badge stock-badge--warning";
  }
  return "stock-badge";
}

export function StockAlertCenterPanel({ items }: StockAlertCenterPanelProps) {
  const criticalItems = items.filter((row) => row.riskLevel === "critical");
  const warningItems = items.filter((row) => row.riskLevel === "warning");
  const unknownItems = items.filter((row) => row.riskLevel === "unknown");
  const noStockItems = items.filter((row) => (row.stockQtyValue ?? 0) <= 0);
  const actionRows = [...items]
    .filter((row) => row.riskLevel !== "normal")
    .sort((a, b) => {
      const riskDiff = toRiskScore(b.riskLevel) - toRiskScore(a.riskLevel);
      if (riskDiff !== 0) {
        return riskDiff;
      }

      const qtyA = a.stockQtyValue ?? Number.MAX_SAFE_INTEGER;
      const qtyB = b.stockQtyValue ?? Number.MAX_SAFE_INTEGER;
      if (qtyA !== qtyB) {
        return qtyA - qtyB;
      }

      return a.itemName.localeCompare(b.itemName, "tr");
    })
    .slice(0, 8);

  return (
    <section className="stock-panel stock-panel--alerts" aria-label="Stok uyari merkezi">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Uyari Merkezi</h3>
          <p>Kritik ve riskli stok kalemlerini aksiyon onceligine gore listeler.</p>
        </div>
      </div>

      <div className="stock-reconciliation-summary">
        <article>
          <span>Kritik kalem</span>
          <strong>{criticalItems.length}</strong>
        </article>
        <article>
          <span>Yaklasan risk</span>
          <strong>{warningItems.length}</strong>
        </article>
        <article>
          <span>Bilinmeyen risk</span>
          <strong>{unknownItems.length}</strong>
        </article>
        <article>
          <span>Stokta 0 veya alti</span>
          <strong>{noStockItems.length}</strong>
        </article>
      </div>

      {actionRows.length === 0 ? (
        <p className="stock-empty-state">Aksiyon gerektiren riskli stok kalemi bulunmuyor.</p>
      ) : (
        <div className="stock-reconciliation-table-wrap">
          <table className="stock-reconciliation-table">
            <thead>
              <tr>
                <th>Urun</th>
                <th>Grup</th>
                <th>Mevcut Stok</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {actionRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.itemCode}</strong>
                    <div className="stock-audit-status-note">{row.itemName}</div>
                  </td>
                  <td>{row.itemGroup}</td>
                  <td>{row.stockQtyLabel}</td>
                  <td>
                    <span className={toRiskBadgeClass(row.riskLevel)}>{toRiskLabel(row.riskLevel)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
