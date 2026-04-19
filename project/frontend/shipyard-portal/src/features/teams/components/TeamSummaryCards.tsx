import type { TeamSummary } from "../types";

type TeamSummaryCardsProps = {
  summary: TeamSummary;
};

export function TeamSummaryCards({ summary }: TeamSummaryCardsProps) {
  const cards = [
    {
      key: "totalMembers",
      label: "Toplam Personel",
      value: summary.totalMembers,
      tone: "neutral" as const
    },
    {
      key: "activeMembers",
      label: "Aktif",
      value: summary.activeMembers,
      tone: "positive" as const
    },
    {
      key: "totalTeams",
      label: "Ekip Sayısı",
      value: summary.totalTeams,
      tone: "neutral" as const
    },
    {
      key: "departments",
      label: "Departman",
      value: summary.departments,
      tone: "neutral" as const
    }
  ];

  return (
    <div className="team-summary-cards">
      {cards.map((card) => (
        <article className={`team-summary-card team-summary-card--${card.tone}`} key={card.key}>
          <span className="team-summary-card__label">{card.label}</span>
          <strong className="team-summary-card__value">{card.value}</strong>
        </article>
      ))}
    </div>
  );
}
