import type { ShiftSnapshot } from "../types";

type ShiftSummaryProps = {
  shift: ShiftSnapshot;
};

export function ShiftSummary({ shift }: ShiftSummaryProps) {
  return (
    <aside className="panel panel--accent">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Vardiya</p>
          <h3>{shift.title}</h3>
        </div>
      </div>
      <dl className="shift-list">
        <div>
          <dt>Saat araligi</dt>
          <dd>{shift.timeRange}</dd>
        </div>
        <div>
          <dt>Ekip</dt>
          <dd>{shift.teamName}</dd>
        </div>
        <div>
          <dt>Odak</dt>
          <dd>{shift.focus}</dd>
        </div>
        <div>
          <dt>Yoklama</dt>
          <dd>{shift.attendance}</dd>
        </div>
      </dl>
    </aside>
  );
}
