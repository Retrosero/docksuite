import type { LeaveApplicationItem, LeaveTrackingViewMode } from "../types";
import { translateLeaveTypeLabel } from "../services/leaveTrackingService";

type LeaveApplicationListProps = {
  rows: LeaveApplicationItem[];
  viewMode: LeaveTrackingViewMode;
};

function statusClassName(tone: LeaveApplicationItem["statusTone"]) {
  if (tone === "positive") {
    return "leave-status leave-status--positive";
  }
  if (tone === "negative") {
    return "leave-status leave-status--negative";
  }
  if (tone === "warning") {
    return "leave-status leave-status--warning";
  }
  return "leave-status leave-status--neutral";
}

export function LeaveApplicationList({ rows, viewMode }: LeaveApplicationListProps) {
  const title = viewMode === "manager" ? "Onay akisi" : "Izinlerim";

  return (
    <section className="screen-card leave-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Leave Application</p>
          <h3>{title}</h3>
        </div>
        <span className="screen-chip">{rows.length} kayit</span>
      </div>

      {rows.length === 0 ? <p className="leave-empty-state">Secilen filtrelerle uyumlu izin talebi bulunamadi.</p> : null}

      {rows.length > 0 ? (
        <div className="leave-application-list">
          {rows.map((row) => (
            <article className="leave-application-card" key={row.id}>
              <div className="leave-application-card__top">
                <div>
                  <strong>{row.employeeName}</strong>
                  <span>{row.employeeId}</span>
                </div>
                <span className={statusClassName(row.statusTone)}>{row.statusLabel}</span>
              </div>

              <div className="leave-application-card__grid">
                <p>
                  <span>Izin tipi</span>
                  {translateLeaveTypeLabel(row.leaveType)}
                </p>
                <p>
                  <span>Baslangic</span>
                  {row.fromDateLabel}
                </p>
                <p>
                  <span>Bitis</span>
                  {row.toDateLabel}
                </p>
                <p>
                  <span>Toplam gun</span>
                  {row.totalDays}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
