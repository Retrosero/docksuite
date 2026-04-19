import type { ZimmetSummary } from "../types";

type ZimmetSummaryCardsProps = {
  summary: ZimmetSummary;
};

export function ZimmetSummaryCards({ summary }: ZimmetSummaryCardsProps) {
  const cards = [
    {
      key: "total",
      label: "Toplam",
      value: summary.total,
      tone: "neutral" as const
    },
    {
      key: "delivered",
      label: "Teslim Edildi",
      value: summary.delivered,
      tone: "positive" as const
    },
    {
      key: "returned",
      label: "İade Edildi",
      value: summary.returned,
      tone: "warning" as const
    },
    {
      key: "pending",
      label: "Beklemede",
      value: summary.pending,
      tone: "neutral" as const
    }
  ];

  return (
    <div className="zimmet-summary-cards">
      {cards.map((card) => (
        <article className={`zimmet-summary-card zimmet-summary-card--${card.tone}`} key={card.key}>
          <span className="zimmet-summary-card__label">{card.label}</span>
          <strong className="zimmet-summary-card__value">{card.value}</strong>
        </article>
      ))}
    </div>
  );
}