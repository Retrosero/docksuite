import { AlertTriangle, Clock3, Network, RefreshCw, UsersRound } from "lucide-react";
import { useHrOrgData } from "../hooks/useHrOrgData";

export function HrOrgChartScreen() {
  const { data, loading, error, refresh } = useHrOrgData();

  return (
    <section className="hr-org-screen">
      <header className="hr-org-hero">
        <div className="hr-org-hero__copy">
          <p className="eyebrow">Organizasyon Semasi</p>
          <h1>Organizasyon Semasi</h1>
          <p>Employee `reports_to` baglantisina gore yonetici-ekip hiyerarsisini sade panelde izleyin.</p>
        </div>
        <button className="hr-org-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-org-state hr-org-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-org-state">
          <Clock3 size={18} aria-hidden="true" />
          <p>Organizasyon semasi verisi yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="hr-org-summary">
            <article className="hr-org-summary__card">
              <span>Toplam Personel</span>
              <strong>{data.summary.totalEmployeeCount}</strong>
              <small>Aktif Employee kayitlari</small>
            </article>
            <article className="hr-org-summary__card">
              <span>Yonetici</span>
              <strong>{data.summary.managerCount}</strong>
              <small>Direkt raporu olan kisi</small>
            </article>
            <article className="hr-org-summary__card">
              <span>Genis Ekip Lideri</span>
              <strong>{data.summary.topManagerCount}</strong>
              <small>5+ direkt raporlu yonetici</small>
            </article>
            <article className="hr-org-summary__card">
              <span>Bagli Personel</span>
              <strong>{data.summary.withManagerCount}</strong>
              <small>reports_to dolu</small>
            </article>
            <article className="hr-org-summary__card">
              <span>Atanmamis</span>
              <strong>{data.summary.withoutManagerCount}</strong>
              <small>Yonetici baglantisi yok</small>
            </article>
          </div>

          <div className="hr-org-layout">
            <section className="hr-org-panel">
              <div className="hr-org-panel__title">
                <div>
                  <p className="eyebrow">Yonetici Dugumleri</p>
                  <h2>Direkt rapor dagilimi</h2>
                </div>
              </div>
              <div className="hr-org-list">
                {data.managers.length === 0 ? (
                  <p className="hr-org-state">Yonetici dugumu bulunmuyor.</p>
                ) : (
                  data.managers.map((manager) => (
                    <article className="hr-org-item" key={manager.managerId}>
                      <div>
                        <strong>{manager.managerName}</strong>
                        <small>
                          Sicil: {manager.managerId} | Departman: {manager.department} | Unvan: {manager.designation}
                        </small>
                        <small>
                          Direkt rapor: {manager.directReports.length} | Ekip:{" "}
                          {manager.directReports
                            .slice(0, 4)
                            .map((item) => item.employeeName)
                            .join(", ") || "-"}
                        </small>
                      </div>
                      <div className="hr-org-item__meta">
                        <UsersRound size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-org-panel">
              <div className="hr-org-panel__title">
                <div>
                  <p className="eyebrow">Departman Dagilimi</p>
                  <h2>Headcount dagilimi</h2>
                </div>
              </div>
              <div className="hr-org-list">
                {data.departmentSummary.length === 0 ? (
                  <p className="hr-org-state">Departman dagilim verisi bulunmuyor.</p>
                ) : (
                  data.departmentSummary.map((item) => (
                    <article className="hr-org-pod" key={item.key}>
                      <Network size={14} aria-hidden="true" />
                      <span>{item.label}</span>
                      <strong>{item.employeeCount}</strong>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="hr-org-panel">
            <div className="hr-org-panel__title">
              <div>
                <p className="eyebrow">Yonetici Atamasi Eksik</p>
                <h2>Ust yoneticiye bagli olmayan personel</h2>
              </div>
            </div>
            <div className="hr-org-list">
              {data.unassignedEmployees.length === 0 ? (
                <p className="hr-org-state">Atanmamis personel bulunmuyor.</p>
              ) : (
                data.unassignedEmployees.map((item) => (
                  <article className="hr-org-item" key={item.employeeId}>
                    <div>
                      <strong>{item.employeeName}</strong>
                      <small>
                        Sicil: {item.employeeId} | Departman: {item.department} | Unvan: {item.designation}
                      </small>
                      <small>Direkt rapor: {item.directReportCount}</small>
                    </div>
                    <div className="hr-org-item__meta">
                      <AlertTriangle size={16} aria-hidden="true" />
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}
