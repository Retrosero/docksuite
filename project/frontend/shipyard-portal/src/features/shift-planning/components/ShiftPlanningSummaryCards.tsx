import type { ShiftPlanningSummary } from "../types";

type ShiftPlanningSummaryCardsProps = {
  summary: ShiftPlanningSummary;
  dateLabel: string;
};

export function ShiftPlanningSummaryCards({ summary, dateLabel }: ShiftPlanningSummaryCardsProps) {
  return (
    <section className="screen-card shift-plan-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Vardiya Plani Ozeti</p>
          <h3>Genel durum</h3>
        </div>
        <span className="screen-chip">{dateLabel}</span>
      </div>
      <div className="shift-plan-summary-grid">
        <article>
          <span>Toplam atama</span>
          <strong>{summary.totalAssignments}</strong>
        </article>
        <article>
          <span>Aktif vardiya</span>
          <strong>{summary.activeAssignments}</strong>
        </article>
        <article>
          <span>Yaklasan atama</span>
          <strong>{summary.upcomingAssignments}</strong>
        </article>
      </div>
    </section>
  );
}
