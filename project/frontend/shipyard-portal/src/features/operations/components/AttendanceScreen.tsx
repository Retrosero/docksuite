import type { AttendanceItem } from "../types";

type AttendanceScreenProps = {
  items: AttendanceItem[];
};

export function AttendanceScreen({ items }: AttendanceScreenProps) {
  return (
    <section className="screen-card screen-card--accent">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Attendance kullanimi</p>
          <h3>Bugunku vardiya paneli</h3>
        </div>
        <span className="screen-chip">Attendance UI</span>
      </div>
      <div className="attendance-grid">
        <div className="attendance-actions">
          <button type="button" className="attendance-button attendance-button--primary">
            Giris yap
          </button>
          <button type="button" className="attendance-button">
            Cikis yap
          </button>
          <div className="attendance-note">
            <strong>Vardiya notu</strong>
            <p>Formen onayi bekleyen kayitlar ayrik kartlarda tutulur.</p>
          </div>
        </div>
        <div className="screen-stack">
          {items.map((item) => (
            <article className="attendance-card" key={item.label}>
              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
