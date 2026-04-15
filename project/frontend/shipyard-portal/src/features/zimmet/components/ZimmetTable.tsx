import type { ZimmetItem } from "../types";

type ZimmetTableProps = {
  items: ZimmetItem[];
  onItemClick?: (item: ZimmetItem) => void;
};

function getStatusClass(status: string): string {
  switch (status) {
    case "Teslim Edildi":
      return "status--delivered";
    case "Kismi Iade":
    case "Tam Iade":
      return "status--returned";
    default:
      return "";
  }
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short"
  }).format(date);
}

export function ZimmetTable({ items, onItemClick }: ZimmetTableProps) {
  if (items.length === 0) {
    return (
      <div className="zimmet-empty">
        <p>Zimmet kaydı bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="zimmet-table-wrapper">
      <table className="zimmet-table">
        <thead>
          <tr>
            <th>Malzeme</th>
            <th>Personel</th>
            <th>Adet</th>
            <th>Durum</th>
            <th>Tarih</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="zimmet-table__row"
            >
              <td>
                <div className="zimmet-table__item">
                  <strong>{item.itemName}</strong>
                  <span>{item.itemCode}</span>
                </div>
              </td>
              <td>{item.employeeName}</td>
              <td>{item.quantity}</td>
              <td>
                <span className={`zimmet-status ${getStatusClass(item.status)}`}>
                  {item.status}
                </span>
              </td>
              <td>{formatDate(item.deliveryDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
