import type { LeaveAllocationSummaryItem } from "../types";
import { translateLeaveTypeLabel } from "../services/leaveTrackingService";

type LeaveAllocationListProps = {
  rows: LeaveAllocationSummaryItem[];
};

export function LeaveAllocationList({ rows }: LeaveAllocationListProps) {
  return (
    <section className="screen-card leave-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Leave Allocation</p>
          <h3>Kalan izin dagilimi</h3>
        </div>
        <span className="screen-chip">{rows.length} izin tipi</span>
      </div>

      {rows.length === 0 ? <p className="leave-empty-state">Secilen filtrelerle uyumlu izin tahsisi bulunamadi.</p> : null}

      {rows.length > 0 ? (
        <div className="leave-allocation-list">
          {rows.map((row) => (
            <article className="leave-allocation-card" key={row.id}>
              <div className="leave-allocation-card__top">
                <strong>{translateLeaveTypeLabel(row.leaveType)}</strong>
                <span>{row.recordCount} tahsis kaydi</span>
              </div>
              <p>{row.periodLabel}</p>
              <dl>
                <div>
                  <dt>Tahsis (gun)</dt>
                  <dd>{row.allocatedDays}</dd>
                </div>
                <div>
                  <dt>Kullanilan</dt>
                  <dd>{row.usedDays}</dd>
                </div>
                <div>
                  <dt>Kalan</dt>
                  <dd>{row.remainingDays}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
