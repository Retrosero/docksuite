import { ChevronRight, Package } from "lucide-react";
import type { ZimmetItem } from "../types";

type ZimmetCardListProps = {
  items: ZimmetItem[];
  onItemClick?: (item: ZimmetItem) => void;
};

function getStatusTone(status: string): "positive" | "warning" | "neutral" {
  switch (status) {
    case "Teslim Edildi":
      return "positive";
    case "Kismi Iade":
    case "Tam Iade":
      return "warning";
    default:
      return "neutral";
  }
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "Tarih yok";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function ZimmetCardList({ items, onItemClick }: ZimmetCardListProps) {
  if (items.length === 0) {
    return (
      <div className="zimmet-empty zimmet-empty--card">
        <p>Zimmet kaydı bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="zimmet-card-list">
      {items.map((item) => (
        <article
          className="zimmet-card"
          key={item.id}
          onClick={() => onItemClick?.(item)}
        >
          <div className="zimmet-card__icon">
            <Package size={18} aria-hidden="true" />
          </div>
          
          <div className="zimmet-card__content">
            <h4 className="zimmet-card__item">{item.itemName}</h4>
            <p className="zimmet-card__code">{item.itemCode}</p>
            <p className="zimmet-card__employee">{item.employeeName}</p>
          </div>

          <div className="zimmet-card__meta">
            <span className={`zimmet-status zimmet-status--${getStatusTone(item.status)}`}>
              {item.status}
            </span>
            <span className="zimmet-card__date">{formatDate(item.deliveryDate)}</span>
          </div>

          <ChevronRight size={16} className="zimmet-card__chevron" />
        </article>
      ))}
    </div>
  );
}
