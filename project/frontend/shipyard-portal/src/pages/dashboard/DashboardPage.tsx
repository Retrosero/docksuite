import { dashboardSnapshot } from "../../features/dashboard/data/dashboardSnapshot";
import { navigateTo } from "../../app/useAppRoute";

const sidebarItems = [
  { label: "Genel Bakis", path: "/", active: true },
  { label: "Gorevler", path: "/gorevler", active: false },
  { label: "Ekipler", path: "/ekipler", active: false },
  { label: "Saha Bildirimi", path: "/saha-bildirimi", active: false },
  { label: "Zimmet", path: "/zimmet", active: false },
  { label: "Attendance", path: "/attendance", active: false },
  { label: "Personel", path: "/personel", active: false }
];

function toneClass(tone: string) {
  return `tone-${tone}`;
}

export function DashboardPage() {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__brand">
          <div>
            <p className="eyebrow">{dashboardSnapshot.sectionLabel}</p>
            <h2>Shipyard Portal</h2>
          </div>
          <span className="dashboard-sidebar__badge">Live</span>
        </div>

        <div className="dashboard-sidebar__panel">
          <p className="dashboard-sidebar__panel-label">{dashboardSnapshot.sidebarLabel}</p>
          <strong>{dashboardSnapshot.sidebarStatValue}</strong>
          <span>{dashboardSnapshot.sidebarStatLabel}</span>
          <p>{dashboardSnapshot.sidebarStatHint}</p>
        </div>

        <nav className="dashboard-sidebar__nav" aria-label="Dashboard gezintisi">
          {sidebarItems.map((item) => (
            <button
              className={`dashboard-sidebar__nav-item${item.active ? " dashboard-sidebar__nav-item--active" : ""}`}
              key={item.label}
              onClick={() => navigateTo(item.path)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="dashboard-sidebar__footer">
          <strong>{dashboardSnapshot.sidebarNote}</strong>
          <p>Tenant-safe yapida marka ve renk bilgisi config katmanindan beslenir.</p>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="eyebrow">{dashboardSnapshot.sectionLabel}</p>
            <h1>{dashboardSnapshot.summaryTitle}</h1>
            <p className="dashboard-topbar__subline">{dashboardSnapshot.summarySubline}</p>
          </div>

          <div className="dashboard-topbar__actions">
            <label className="dashboard-search">
              <span aria-hidden="true">Ara</span>
              <input type="search" placeholder="Gorev, ekip veya zimmet ara" />
            </label>
            <button className="dashboard-button dashboard-button--ghost" onClick={() => navigateTo("/personel")} type="button">
              Rapor al
            </button>
            <button
              className="dashboard-button dashboard-button--primary"
              onClick={() => navigateTo("/personel/yeni")}
              type="button"
            >
              Yeni islem
            </button>
          </div>
        </header>

        <section className="dashboard-kpi-grid" aria-label="Temel metrikler">
          {dashboardSnapshot.kpis.map((kpi) => (
            <article className={`dashboard-kpi ${toneClass(kpi.tone)}`} key={kpi.label}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <p>{kpi.delta}</p>
            </article>
          ))}
        </section>

        <section className="dashboard-hero card">
          <div className="dashboard-hero__content">
            <p className="dashboard-hero__eyebrow">Anlik durum</p>
            <h2>{dashboardSnapshot.headline}</h2>
            <p>{dashboardSnapshot.subline}</p>
            <div className="dashboard-hero__chips">
              <span>Mobil saha uyumlu</span>
              <span>Flowbite dashboard dili</span>
              <span>Tenant-safe</span>
            </div>
          </div>

          <div className="dashboard-hero__stats">
            <div className="dashboard-hero__stat">
              <span>Aktif ekip</span>
              <strong>{dashboardSnapshot.activeTeamCount}</strong>
            </div>
            <div className="dashboard-hero__stat">
              <span>Acik bildirim</span>
              <strong>{dashboardSnapshot.openIssueCount}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-content-grid">
          <article className="card dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <p className="eyebrow">Is yuku</p>
                <h3>Gorev dagilimi</h3>
              </div>
              <span className="dashboard-chip">Bugun</span>
            </div>

            <div className="dashboard-bars">
              {dashboardSnapshot.workload.map((item) => (
                <div className="dashboard-bar-row" key={item.label}>
                  <div className="dashboard-bar-row__label">
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                  </div>
                  <div className="dashboard-bar">
                    <span className={toneClass(item.tone)} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="dashboard-right-column">
            <article className="card dashboard-card dashboard-card--soft">
              <div className="dashboard-card__header">
                <div>
                  <p className="eyebrow">Kisa aksiyon</p>
                  <h3>Hizli islemler</h3>
                </div>
              </div>
              <div className="dashboard-action-list">
                {dashboardSnapshot.actions.map((action) => (
                  <button
                    className="dashboard-action"
                    key={action.title}
                    onClick={() => navigateTo(action.path)}
                    type="button"
                  >
                    <strong>{action.title}</strong>
                    <span>{action.description}</span>
                  </button>
                ))}
              </div>
            </article>

            <article className="card dashboard-card">
              <div className="dashboard-card__header">
                <div>
                  <p className="eyebrow">Ekip</p>
                  <h3>Canli durum</h3>
                </div>
              </div>
              <div className="dashboard-team-list">
                {dashboardSnapshot.teams.map((team) => (
                  <div className="dashboard-team" key={team.name}>
                    <div>
                      <strong>{team.name}</strong>
                      <span>{team.role}</span>
                    </div>
                    <div className="dashboard-team__meta">
                      <span>{team.load}</span>
                      <strong>{team.status}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>

        <section className="dashboard-bottom-grid">
          <article className="card dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <p className="eyebrow">Planlama</p>
                <h3>Bugunun gorevleri</h3>
              </div>
            </div>

            <div className="dashboard-table">
              <div className="dashboard-table__head">
                <span>Gorev</span>
                <span>Sorumlu</span>
                <span>Vardiya</span>
                <span>Oncelik</span>
              </div>

              {dashboardSnapshot.tasks.map((task) => (
                <div className="dashboard-table__row" key={task.title}>
                  <div>
                    <strong>{task.title}</strong>
                    <span>{task.status}</span>
                  </div>
                  <span>{task.owner}</span>
                  <span>{task.team}</span>
                  <span className={`priority priority--${task.priority.toLowerCase()}`}>{task.priority}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="card dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <p className="eyebrow">Akis</p>
                <h3>Son hareketler</h3>
              </div>
            </div>

            <div className="dashboard-activity-list">
              {dashboardSnapshot.activities.map((activity) => (
                <div className="dashboard-activity" key={activity.title}>
                  <span className={`dashboard-activity__dot ${toneClass(activity.tone)}`} aria-hidden="true" />
                  <div>
                    <div className="dashboard-activity__top">
                      <strong>{activity.title}</strong>
                      <span>{activity.time}</span>
                    </div>
                    <p>{activity.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
