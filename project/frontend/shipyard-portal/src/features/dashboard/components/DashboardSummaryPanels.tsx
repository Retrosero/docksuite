import type { DashboardCriticalStock, DashboardFeedActivity, DashboardOpenTask, DashboardShiftOverview } from "../types";

type DashboardSummaryPanelsProps = {
  shiftOverview: DashboardShiftOverview;
  openTasks: DashboardOpenTask[];
  openTaskTotal: number;
  criticalStocks: DashboardCriticalStock[];
  criticalStockTotal: number;
  activities: DashboardFeedActivity[];
};

function toneClass(tone: DashboardFeedActivity["tone"]) {
  return `tone-${tone}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Termin yok";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit"
  }).format(parsed);
}

export function DashboardSummaryPanels({
  shiftOverview,
  openTasks,
  openTaskTotal,
  criticalStocks,
  criticalStockTotal,
  activities
}: DashboardSummaryPanelsProps) {
  return (
    <>
      <section className="dashboard-content-grid">
        <article className="card dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <p className="eyebrow">Bugunku vardiya</p>
              <h3>Yoklama ozeti</h3>
            </div>
            <span className="dashboard-chip">Canli</span>
          </div>

          <div className="dashboard-bars">
            <div className="dashboard-bar-row">
              <div className="dashboard-bar-row__label">
                <strong>Toplam yoklama</strong>
                <span>{shiftOverview.totalAttendance}</span>
              </div>
            </div>
            <div className="dashboard-bar-row">
              <div className="dashboard-bar-row__label">
                <strong>Present</strong>
                <span>{shiftOverview.presentCount}</span>
              </div>
            </div>
            <div className="dashboard-bar-row">
              <div className="dashboard-bar-row__label">
                <strong>Absent / Izin</strong>
                <span>{shiftOverview.absentCount}</span>
              </div>
            </div>
            <div className="dashboard-bar-row">
              <div className="dashboard-bar-row__label">
                <strong>Aktif vardiya tipi</strong>
                <span>{shiftOverview.shiftCount}</span>
              </div>
            </div>
          </div>
        </article>

        <aside className="dashboard-right-column">
          <article className="card dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <p className="eyebrow">Acik gorevler</p>
                <h3>Ilk 5 kayit</h3>
              </div>
              <span className="dashboard-chip">Toplam {openTaskTotal}</span>
            </div>
            <div className="dashboard-team-list">
              {openTasks.length === 0 ? (
                <p className="dashboard-state">Acik gorev bulunamadi.</p>
              ) : (
                openTasks.map((task) => (
                  <div className="dashboard-team" key={task.id}>
                    <div>
                      <strong>{task.title}</strong>
                      <span>{task.owner}</span>
                    </div>
                    <div className="dashboard-team__meta">
                      <span>{task.status}</span>
                      <strong>{formatDate(task.dueDate)}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="card dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <p className="eyebrow">Kritik stok</p>
                <h3>Oncelikli kalemler</h3>
              </div>
              <span className="dashboard-chip">Toplam {criticalStockTotal}</span>
            </div>

            <div className="dashboard-team-list">
              {criticalStocks.length === 0 ? (
                <p className="dashboard-state">Kritik stok kaydi bulunamadi.</p>
              ) : (
                criticalStocks.map((item) => (
                  <div className="dashboard-team" key={item.id}>
                    <div>
                      <strong>{item.itemCode}</strong>
                      <span>{item.itemName}</span>
                    </div>
                    <div className="dashboard-team__meta">
                      <span>{item.location}</span>
                      <strong>{item.indicator}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </aside>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="card dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <p className="eyebrow">Son aktiviteler</p>
              <h3>Operasyon akis ozeti</h3>
            </div>
          </div>

          <div className="dashboard-activity-list">
            {activities.length === 0 ? (
              <p className="dashboard-state">Aktivite akisi bulunamadi.</p>
            ) : (
              activities.map((activity) => (
                <div className="dashboard-activity" key={activity.id}>
                  <span className={`dashboard-activity__dot ${toneClass(activity.tone)}`} aria-hidden="true" />
                  <div>
                    <div className="dashboard-activity__top">
                      <strong>{activity.title}</strong>
                      <span>{activity.timeLabel}</span>
                    </div>
                    <p>{activity.detail}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </>
  );
}
