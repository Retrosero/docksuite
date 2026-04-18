import type { LeaveHistory } from "../types";

type LeaveHistorySectionProps = {
  leaveHistory: LeaveHistory | null;
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

export function LeaveHistorySection({ leaveHistory, loading }: LeaveHistorySectionProps) {
  if (loading) {
    return (
      <article className="leave-history-card">
        <p className="eyebrow">Izin Gecmisi</p>
        <p className="leave-state">Izin gecmisi yukleniyor...</p>
      </article>
    );
  }

  if (!leaveHistory || leaveHistory.items.length === 0) {
    return (
      <article className="leave-history-card leave-history-card--empty">
        <p className="eyebrow">Izin Gecmisi</p>
        <div className="leave-empty">
          <p>Bu personel icin izin kaydi bulunmuyor.</p>
        </div>
      </article>
    );
  }

  const { summary, items } = leaveHistory;

  return (
    <article className="leave-history-card">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Izin Gecmisi</p>
          <h3>Kullanılan İzinler</h3>
        </div>
      </div>

      <div className="leave-summary-grid">
        <div className="leave-summary-item">
          <span>Toplam Basvuru</span>
          <strong>{summary.totalApplications}</strong>
        </div>
        <div className="leave-summary-item">
          <span>Onaylanan Gun</span>
          <strong className="text-positive">{summary.approvedDays}</strong>
        </div>
        <div className="leave-summary-item">
          <span>Bekleyen Gun</span>
          <strong className="text-warning">{summary.pendingDays}</strong>
        </div>
        <div className="leave-summary-item">
          <span>Reddedilen Gun</span>
          <strong className="text-negative">{summary.rejectedDays}</strong>
        </div>
      </div>

      <div className="leave-items-list">
        {items.slice(0, 5).map(item => (
          <div key={item.id} className="leave-item">
            <div className="leave-item__header">
              <span className="leave-type">{item.leaveType}</span>
              <span className={`leave-status leave-status--${item.status}`}>
                {item.statusLabel}
              </span>
            </div>
            <div className="leave-item__dates">
              <span>{formatDate(item.fromDate)} - {formatDate(item.toDate)}</span>
              <span className="leave-days">{item.totalDays} gun</span>
            </div>
          </div>
        ))}
        {items.length > 5 && (
          <p className="leave-more">+ {items.length - 5} kayit daha mevcut</p>
        )}
      </div>
    </article>
  );
}
