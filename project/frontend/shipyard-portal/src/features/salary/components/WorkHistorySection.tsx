import type { WorkHistory } from "../types";

type WorkHistorySectionProps = {
  workHistory: WorkHistory | null;
  loading: boolean;
  period?: string;
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short"
  }).format(parsed);
}

export function WorkHistorySection({ workHistory, loading, period }: WorkHistorySectionProps) {
  if (loading) {
    return (
      <article className="work-history-card">
        <p className="eyebrow">Calışma Gecmisi</p>
        <p className="work-state">Calışma gecmisi yukleniyor...</p>
      </article>
    );
  }

  if (!workHistory || workHistory.items.length === 0) {
    return (
      <article className="work-history-card work-history-card--empty">
        <p className="eyebrow">Calışma Gecmisi</p>
        <div className="work-empty">
          <p>Bu donem icin calışma kaydi bulunmuyor.</p>
        </div>
      </article>
    );
  }

  const { summary, items } = workHistory;

  return (
    <article className="work-history-card">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Calışma Gecmisi</p>
          <h3>{period || "Bu Ay"}</h3>
        </div>
        <span className="work-period-badge">{workHistory.period}</span>
      </div>

      <div className="work-summary-grid">
        <div className="work-summary-item">
          <span>Toplam Gun</span>
          <strong>{summary.totalDays}</strong>
        </div>
        <div className="work-summary-item">
          <span>Devamli Gun</span>
          <strong className="text-positive">{summary.presentDays}</strong>
        </div>
        <div className="work-summary-item">
          <span>Devamsiz Gun</span>
          <strong className="text-negative">{summary.absentDays}</strong>
        </div>
        <div className="work-summary-item">
          <span>Toplam Saat</span>
          <strong>{summary.totalHoursWorked.toFixed(1)}</strong>
        </div>
        <div className="work-summary-item">
          <span>Mesai Saati</span>
          <strong className="text-warning">{summary.overtimeHours.toFixed(1)}</strong>
        </div>
        <div className="work-summary-item">
          <span>Ort. Gunluk Saat</span>
          <strong>{summary.avgHoursPerDay.toFixed(1)}</strong>
        </div>
      </div>

      <div className="work-items-list">
        <h4>Son Calışma Kayitlari</h4>
        {items.slice(0, 7).map(item => (
          <div key={item.id} className="work-item">
            <div className="work-item__date">
              <span>{formatDate(item.date)}</span>
              <span className={`work-status work-status--${item.status.toLowerCase()}`}>
                {item.status === "present" ? "Katildi" : item.status === "absent" ? "Gelmedi" : item.status}
              </span>
            </div>
            <div className="work-item__times">
              <span>Giris: {item.checkin !== "-" ? formatDate(item.checkin) : "-"}</span>
              <span>Cikis: {item.checkout !== "-" ? formatDate(item.checkout) : "-"}</span>
              <span className="work-item__hours">{item.hoursWorked.toFixed(1)} saat</span>
            </div>
          </div>
        ))}
        {items.length > 7 && (
          <p className="work-more">+ {items.length - 7} kayit daha mevcut</p>
        )}
      </div>
    </article>
  );
}
