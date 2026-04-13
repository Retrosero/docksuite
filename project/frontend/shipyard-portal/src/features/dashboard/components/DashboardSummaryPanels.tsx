import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  Clock3,
  Layers3,
  ShipWheel,
  Sparkles,
  TriangleAlert
} from "lucide-react";
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

function activityIcon(tone: DashboardFeedActivity["tone"]) {
  if (tone === "sea") {
    return Layers3;
  }
  if (tone === "sand") {
    return ClipboardList;
  }
  if (tone === "steel") {
    return TriangleAlert;
  }
  return Sparkles;
}

export function DashboardSummaryPanels({
  shiftOverview,
  openTasks,
  openTaskTotal,
  criticalStocks,
  criticalStockTotal,
  activities
}: DashboardSummaryPanelsProps) {
  const highlightStock = criticalStocks[0] ?? null;
  const latestTask = openTasks[0] ?? null;
  const activityRows = activities.slice(0, 4);

  return (
    <section className="dashboard-bento">
      <div className="dashboard-bento__lead">
        <article className="card dashboard-panel dashboard-panel--summary">
          <div className="dashboard-panel__header">
            <div>
              <p className="eyebrow">Operasyon özeti</p>
              <h3>Güncel akış</h3>
            </div>
            <button className="dashboard-panel__link" type="button">
              Tam rapor <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="dashboard-feed">
            {activityRows.length === 0 ? (
              <p className="dashboard-state">Aktivite akışı bulunamadı.</p>
            ) : (
              activityRows.map((activity) => {
                const Icon = activityIcon(activity.tone);

                return (
                  <div className="dashboard-feed__item" key={activity.id}>
                    <div className={`dashboard-feed__icon ${toneClass(activity.tone)}`}>
                      <Icon size={16} strokeWidth={2.2} />
                    </div>
                    <div className="dashboard-feed__body">
                      <div className="dashboard-feed__top">
                        <strong>{activity.title}</strong>
                        <span>{activity.timeLabel}</span>
                      </div>
                      <p>{activity.detail}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <article className="card dashboard-panel dashboard-panel--alert">
          <div className="dashboard-panel__header dashboard-panel__header--compact">
            <div>
              <p className="eyebrow">Kritik uyarılar</p>
              <h3>Kırmızı alanlar</h3>
            </div>
            <TriangleAlert size={18} />
          </div>

          {highlightStock ? (
            <>
              <p className="dashboard-panel__alert-copy">
                <strong>{highlightStock.itemCode}</strong> için kritik stok uyarısı açık. Önceliği depo ve saha teslim planına alın.
              </p>
              <div className="dashboard-panel__alert-meta">
                <span>{highlightStock.itemName}</span>
                <strong>{highlightStock.location}</strong>
              </div>
            </>
          ) : (
            <>
              <p className="dashboard-panel__alert-copy">
                Şu anda kritik stok kaydı yok. Yeni saha bildirimi veya malzeme talebi oluştuğunda bu alan otomatik güncellenir.
              </p>
              <div className="dashboard-panel__alert-meta">
                <span>Güncel risk</span>
                <strong>Düşük</strong>
              </div>
            </>
          )}

          <button className="dashboard-panel__pill dashboard-panel__pill--danger" type="button">
            {criticalStockTotal} kritik kalem
          </button>
        </article>
      </div>

      <div className="dashboard-bento__rail">
        <article className="card dashboard-panel dashboard-panel--tasks">
          <div className="dashboard-panel__header">
            <div>
              <p className="eyebrow">Açık görevler</p>
              <h3>İlk 5 kayıt</h3>
            </div>
            <button className="dashboard-panel__link" type="button">
              {openTaskTotal} toplam <ClipboardList size={14} />
            </button>
          </div>

          <div className="dashboard-task-list">
            {openTasks.length === 0 ? (
              <p className="dashboard-state">Açık görev bulunamadı.</p>
            ) : (
              openTasks.map((task) => (
                <div className="dashboard-task" key={task.id}>
                  <div className="dashboard-task__copy">
                    <strong>{task.title}</strong>
                    <span>{task.owner}</span>
                  </div>
                  <div className="dashboard-task__meta">
                    <span>{task.status}</span>
                    <strong>{formatDate(task.dueDate)}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="card dashboard-panel dashboard-panel--shifts">
          <div className="dashboard-panel__header">
            <div>
              <p className="eyebrow">Yaklaşan vardiya</p>
              <h3>Yoklama özeti</h3>
            </div>
            <ShipWheel size={18} />
          </div>

          <div className="dashboard-shift-summary">
            <div>
              <span>Toplam yoklama</span>
              <strong>{shiftOverview.totalAttendance}</strong>
            </div>
            <div>
              <span>Present</span>
              <strong>{shiftOverview.presentCount}</strong>
            </div>
            <div>
              <span>Absent / İzin</span>
              <strong>{shiftOverview.absentCount}</strong>
            </div>
            <div>
              <span>Aktif vardiya tipi</span>
              <strong>{shiftOverview.shiftCount}</strong>
            </div>
          </div>

          <div className="dashboard-shift-card">
            <div>
              <span>Bugün</span>
              <strong>Vardiya akışı</strong>
            </div>
            <p>{shiftOverview.presentCount} personel sahada, {shiftOverview.absentCount} kişi beklemede.</p>
          </div>

          <div className="dashboard-shift-card dashboard-shift-card--muted">
            <div>
              <span>Son kayıt</span>
              <strong>{latestTask ? latestTask.title : "Kayıt yok"}</strong>
            </div>
            <p>{latestTask ? `${latestTask.status} • ${latestTask.owner}` : "Bugün için görev verisi bekleniyor."}</p>
          </div>
        </article>

        <article className="card dashboard-panel dashboard-panel--inventory">
          <div className="dashboard-panel__header">
            <div>
              <p className="eyebrow">Stok durumu</p>
              <h3>Öncelikli kalemler</h3>
            </div>
            <button className="dashboard-panel__link" type="button">
              {criticalStockTotal} toplam <BarChart3 size={14} />
            </button>
          </div>

          <div className="dashboard-inventory-list">
            {criticalStocks.length === 0 ? (
              <p className="dashboard-state">Kritik stok kaydı bulunamadı.</p>
            ) : (
              criticalStocks.slice(0, 3).map((item, index) => {
                const fill = Math.max(24, 100 - index * 22);

                return (
                  <div className="dashboard-inventory" key={item.id}>
                    <div className="dashboard-inventory__top">
                      <strong>{item.itemCode}</strong>
                      <span>{item.indicator}</span>
                    </div>
                    <p>{item.itemName}</p>
                    <div className="dashboard-progress" aria-hidden="true">
                      <span style={{ width: `${fill}%` }} />
                    </div>
                    <small>{item.location}</small>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </div>

      <section className="dashboard-bottom-grid">
        <article className="card dashboard-panel dashboard-panel--chart">
          <div className="dashboard-panel__header">
            <div>
              <p className="eyebrow">Personel sağlığı</p>
              <h3>Bu hafta</h3>
            </div>
            <span className="dashboard-panel__chip">Canlı</span>
          </div>

          <div className="dashboard-chart">
            <div className="dashboard-chart__column">
              <span className="dashboard-chart__bar" style={{ height: `${Math.min(150, Math.max(34, shiftOverview.presentCount * 4))}px` }} />
              <small>Present</small>
            </div>
            <div className="dashboard-chart__column">
              <span className="dashboard-chart__bar dashboard-chart__bar--soft" style={{ height: `${Math.min(150, Math.max(28, shiftOverview.absentCount * 6))}px` }} />
              <small>İzin</small>
            </div>
            <div className="dashboard-chart__column">
              <span className="dashboard-chart__bar" style={{ height: `${Math.min(150, Math.max(30, shiftOverview.shiftCount * 18))}px` }} />
              <small>Vardiya</small>
            </div>
            <div className="dashboard-chart__column">
              <span className="dashboard-chart__bar dashboard-chart__bar--soft" style={{ height: `${Math.min(150, Math.max(24, openTaskTotal * 6))}px` }} />
              <small>Görev</small>
            </div>
            <div className="dashboard-chart__column">
              <span className="dashboard-chart__bar" style={{ height: `${Math.min(150, Math.max(24, criticalStockTotal * 8))}px` }} />
              <small>Stok</small>
            </div>
          </div>
        </article>

        <article className="card dashboard-panel dashboard-panel--chart">
          <div className="dashboard-panel__header">
            <div>
              <p className="eyebrow">Stok dağılımı</p>
              <h3>Genel denge</h3>
            </div>
            <span className="dashboard-panel__chip">Özet</span>
          </div>

          <div className="dashboard-donut">
            <div className="dashboard-donut__ring" aria-hidden="true">
              <span />
            </div>
            <div className="dashboard-donut__copy">
              <strong>{criticalStockTotal.toLocaleString("tr-TR")}</strong>
              <span>kritik kalem</span>
            </div>
          </div>

          <div className="dashboard-legend">
            <span>
              <i className="dashboard-legend__dot dashboard-legend__dot--primary" />
              Teknik parçalar
            </span>
            <span>
              <i className="dashboard-legend__dot dashboard-legend__dot--secondary" />
              Güvenlik ekipmanı
            </span>
          </div>
        </article>

        <article className="card dashboard-panel dashboard-panel--chart">
          <div className="dashboard-panel__header">
            <div>
              <p className="eyebrow">Son hareketler</p>
              <h3>Operasyon özeti</h3>
            </div>
            <button className="dashboard-panel__link" type="button">
              Tarihçe <Clock3 size={14} />
            </button>
          </div>

          <div className="dashboard-summary-list">
            {activities.length === 0 ? (
              <p className="dashboard-state">Aktivite akışı bulunamadı.</p>
            ) : (
              activities.slice(0, 3).map((activity) => (
                <div className="dashboard-summary-list__item" key={activity.id}>
                  <div>
                    <strong>{activity.title}</strong>
                    <span>{activity.detail}</span>
                  </div>
                  <small>{activity.timeLabel}</small>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <footer className="dashboard-footer-strip">
        <div>
          <span>Canlı senkron</span>
          <strong>{shiftOverview.presentCount} sahada, {shiftOverview.absentCount} yok</strong>
        </div>
        <div>
          <span>Öncelik</span>
          <strong>{criticalStockTotal > 0 ? "Stok kontrolü" : "Vardiya takibi"}</strong>
        </div>
        <div>
          <span>Genel durum</span>
          <strong>{openTaskTotal > 0 ? `${openTaskTotal} açık görev` : "Görevler kapalı"}</strong>
        </div>
      </footer>
    </section>
  );
}
