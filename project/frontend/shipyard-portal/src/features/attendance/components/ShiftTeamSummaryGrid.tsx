import type { ShiftTeamSummary } from "../types";

type ShiftTeamSummaryGridProps = {
  rows: ShiftTeamSummary[];
};

export function ShiftTeamSummaryGrid({ rows }: ShiftTeamSummaryGridProps) {
  return (
    <section className="screen-card shift-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Formen ekibi</p>
          <h3>Ekip bazli durum</h3>
        </div>
      </div>

      {rows.length === 0 ? <p className="shift-empty-state">Secilen filtrede ekip verisi bulunamadi.</p> : null}

      {rows.length > 0 ? (
        <div className="shift-team-grid">
          {rows.map((row) => (
            <article className="shift-team-card" key={row.teamName}>
              <div className="shift-team-card__top">
                <strong>{row.teamName}</strong>
                <span>{row.total} kisi</span>
              </div>
              <dl>
                <div>
                  <dt>Katildi</dt>
                  <dd>{row.present}</dd>
                </div>
                <div>
                  <dt>Gelmedi</dt>
                  <dd>{row.absent}</dd>
                </div>
                <div>
                  <dt>Diger</dt>
                  <dd>{row.other}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
