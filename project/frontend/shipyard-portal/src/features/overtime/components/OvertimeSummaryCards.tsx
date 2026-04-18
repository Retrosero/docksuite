import type { OvertimeSummary } from "../types";

type OvertimeSummaryCardsProps = {
  summary: OvertimeSummary;
  dateLabel: string;
  viewMode: "employee" | "manager";
};

export function OvertimeSummaryCards({ summary, dateLabel, viewMode }: OvertimeSummaryCardsProps) {
  return (
    <section className="screen-card overtime-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Mesai Ozeti</p>
          <h3>{viewMode === "manager" ? "Genel mesai durumu" : "Kendi mesai kayitlarim"}</h3>
        </div>
        <span className="screen-chip">{dateLabel}</span>
      </div>
      <div className="overtime-summary-grid">
        <article>
          <span>Toplam talep</span>
          <strong>{summary.totalRequests}</strong>
        </article>
        <article>
          <span>Onay bekleyen</span>
          <strong>{summary.pendingRequests}</strong>
        </article>
        <article>
          <span>Onaylanan</span>
          <strong>{summary.approvedRequests}</strong>
        </article>
        <article>
          <span>Reddedilen</span>
          <strong>{summary.rejectedRequests}</strong>
        </article>
        <article>
          <span>Toplam mesai (saat)</span>
          <strong>{summary.totalHours}</strong>
        </article>
        <article>
          <span>Onaylanan saat</span>
          <strong>{summary.approvedHours}</strong>
        </article>
      </div>
    </section>
  );
}
