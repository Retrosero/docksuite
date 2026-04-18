import type { OvertimeHistory } from "../types";

type OvertimeHistorySectionProps = {
  overtimeHistory: OvertimeHistory | null;
  loading: boolean;
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parsed);
}

export function OvertimeHistorySection({ overtimeHistory, loading }: OvertimeHistorySectionProps) {
  if (loading) {
    return (
      <article className="overtime-history-card">
        <p className="eyebrow">Mesai Gecmisi</p>
        <p className="overtime-state">Mesai gecmisi yukleniyor...</p>
      </article>
    );
  }

  if (!overtimeHistory || overtimeHistory.items.length === 0) {
    return (
      <article className="overtime-history-card overtime-history-card--empty">
        <p className="eyebrow">Mesai Gecmisi</p>
        <div className="overtime-empty">
          <p>Bu personel icin mesai kaydi bulunmuyor.</p>
        </div>
      </article>
    );
  }

  const { summary, items } = overtimeHistory;

  return (
    <article className="overtime-history-card">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Mesai Gecmisi</p>
          <h3>Fazla Mesai Kayitlari</h3>
        </div>
      </div>

      <div className="overtime-summary-grid">
        <div className="overtime-summary-item">
          <span>Toplam Mesai</span>
          <strong>{summary.totalHours.toFixed(1)} saat</strong>
        </div>
        <div className="overtime-summary-item">
          <span>Onaylanan</span>
          <strong className="text-positive">{summary.approvedHours.toFixed(1)} saat</strong>
        </div>
        <div className="overtime-summary-item">
          <span>Bekleyen</span>
          <strong className="text-warning">{summary.pendingHours.toFixed(1)} saat</strong>
        </div>
        <div className="overtime-summary-item">
          <span>Reddedilen</span>
          <strong className="text-negative">{summary.rejectedHours.toFixed(1)} saat</strong>
        </div>
      </div>

      <div className="overtime-rate-info">
        <span>Mesai ucret carpanlari:</span>
        <strong>Hafta ici 1.5x | Hafta sonu/tatil 2.0x</strong>
      </div>

      <div className="overtime-items-list">
        {items.slice(0, 5).map(item => (
          <div key={item.id} className="overtime-item">
            <div className="overtime-item__header">
              <span className="overtime-date">{formatDate(item.date)}</span>
              <span className={`overtime-status overtime-status--${item.status}`}>
                {item.statusLabel}
              </span>
            </div>
            <div className="overtime-item__details">
              <span className="overtime-hours">{item.hours} saat</span>
              {item.reason && <span className="overtime-reason">{item.reason}</span>}
            </div>
          </div>
        ))}
        {items.length > 5 && (
          <p className="overtime-more">+ {items.length - 5} kayit daha mevcut</p>
        )}
      </div>
    </article>
  );
}
