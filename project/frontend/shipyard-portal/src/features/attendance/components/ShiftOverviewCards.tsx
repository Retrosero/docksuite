import type { ShiftSummary } from "../types";

type ShiftOverviewCardsProps = {
  summary: ShiftSummary;
  dateLabel: string;
};

export function ShiftOverviewCards({ summary, dateLabel }: ShiftOverviewCardsProps) {
  return (
    <section className="screen-card shift-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Bugunku vardiya ozeti</p>
          <h3>{dateLabel}</h3>
        </div>
        <span className="screen-chip">{summary.shiftTypeCount} vardiya tipi</span>
      </div>
      <div className="shift-summary-grid">
        <article>
          <span>Toplam</span>
          <strong>{summary.total}</strong>
        </article>
        <article>
          <span>Katildi</span>
          <strong>{summary.present}</strong>
        </article>
        <article>
          <span>Gelmedi</span>
          <strong>{summary.absent}</strong>
        </article>
        <article>
          <span>Yarim gun</span>
          <strong>{summary.halfDay}</strong>
        </article>
        <article>
          <span>Izinli</span>
          <strong>{summary.onLeave}</strong>
        </article>
        <article>
          <span>Aktif ekip</span>
          <strong>{summary.teamCount}</strong>
        </article>
      </div>
    </section>
  );
}
