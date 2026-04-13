import type { ShiftEmployeeRow, ShiftTrackingViewMode } from "../types";

type ShiftEmployeeListProps = {
  rows: ShiftEmployeeRow[];
  viewMode: ShiftTrackingViewMode;
  activeEmployeeId: string | null;
};

function statusClassName(tone: ShiftEmployeeRow["statusTone"]) {
  if (tone === "positive") {
    return "shift-status shift-status--positive";
  }
  if (tone === "negative") {
    return "shift-status shift-status--negative";
  }
  if (tone === "warning") {
    return "shift-status shift-status--warning";
  }
  return "shift-status shift-status--neutral";
}

export function ShiftEmployeeList({ rows, viewMode, activeEmployeeId }: ShiftEmployeeListProps) {
  return (
    <section className="screen-card shift-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Calisan listesi</p>
          <h3>{viewMode === "worker" ? "Kendi vardiyam" : "Ekip vardiya kayitlari"}</h3>
        </div>
        <span className="screen-chip">{rows.length} kayit</span>
      </div>

      {viewMode === "worker" && !activeEmployeeId ? (
        <p className="shift-empty-state">Kullaniciya bagli employee kaydi bulunamadi. Formen gorunumune gecip listeyi inceleyin.</p>
      ) : null}

      {rows.length === 0 ? <p className="shift-empty-state">Secilen filtreyle uyumlu vardiya kaydi bulunamadi.</p> : null}

      {rows.length > 0 ? (
        <div className="shift-employee-list">
          {rows.map((row) => (
            <article className="shift-employee-card" key={row.id}>
              <div className="shift-employee-card__top">
                <div>
                  <strong>{row.employeeName}</strong>
                  <span>{row.employeeId}</span>
                </div>
                <span className={statusClassName(row.statusTone)}>{row.statusLabel}</span>
              </div>

              <div className="shift-employee-card__grid">
                <p>
                  <span>Ekip</span>
                  {row.teamName}
                </p>
                <p>
                  <span>Unvan</span>
                  {row.designation}
                </p>
                <p>
                  <span>Vardiya</span>
                  {row.shiftLabel}
                </p>
                <p>
                  <span>Giris / Cikis</span>
                  {row.checkinTimeLabel} - {row.checkoutTimeLabel}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
