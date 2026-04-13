import type { LeaveSummary, LeaveTrackingViewMode } from "../types";

type LeaveSummaryCardsProps = {
  summary: LeaveSummary;
  dateLabel: string;
  viewMode: LeaveTrackingViewMode;
};

export function LeaveSummaryCards({ summary, dateLabel, viewMode }: LeaveSummaryCardsProps) {
  return (
    <section className="screen-card leave-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Izin ozeti</p>
          <h3>{viewMode === "manager" ? "Onay ve kullanim ozeti" : "Izin bakiyesi"}</h3>
        </div>
        <span className="screen-chip">{dateLabel}</span>
      </div>
      <div className="leave-summary-grid">
        <article>
          <span>Toplam talep</span>
          <strong>{summary.totalApplications}</strong>
        </article>
        <article>
          <span>Onay bekleyen</span>
          <strong>{summary.pendingApplications}</strong>
        </article>
        <article>
          <span>Onaylanan</span>
          <strong>{summary.approvedApplications}</strong>
        </article>
        <article>
          <span>Kalan izin (gun)</span>
          <strong>{summary.remainingDays}</strong>
        </article>
      </div>
    </section>
  );
}
