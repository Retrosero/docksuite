import { AlertTriangle, CheckCircle2, Clock3, LogOut, RefreshCw, ShieldAlert } from "lucide-react";
import { useHrOffboardingData } from "../hooks/useHrOffboardingData";
import type { HrOffboardingItem } from "../types";

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("tr-TR").format(parsed);
}

function statusToneClass(item: HrOffboardingItem) {
  if (item.statusTone === "positive") return "hr-offboarding__badge--positive";
  if (item.statusTone === "warning") return "hr-offboarding__badge--warning";
  if (item.statusTone === "negative") return "hr-offboarding__badge--negative";
  return "hr-offboarding__badge--neutral";
}

export function HrOffboardingScreen() {
  const { data, loading, error, refresh } = useHrOffboardingData();

  return (
    <section className="hr-offboarding-screen">
      <header className="hr-offboarding-hero">
        <div className="hr-offboarding-hero__copy">
          <p className="eyebrow">Isten Cikis Sureci</p>
          <h1>Isten Cikis Sureci</h1>
          <p>Employee Separation kayitlarini zimmet, gorusme ve final hesaplasma adimlariyla birlikte izleyin.</p>
        </div>
        <button className="hr-offboarding-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-offboarding-state hr-offboarding-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-offboarding-state">
          <Clock3 size={18} aria-hidden="true" />
          <p>Isten cikis sureci verisi yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="hr-offboarding-summary">
            <article className="hr-offboarding-summary__card">
              <span>Toplam Kayit</span>
              <strong>{data.summary.totalRecords}</strong>
              <small>Offboarding sureci</small>
            </article>
            <article className="hr-offboarding-summary__card">
              <span>Tamamlanan</span>
              <strong>{data.summary.completedCount}</strong>
              <small>Sureci bitenler</small>
            </article>
            <article className="hr-offboarding-summary__card">
              <span>Devam Eden</span>
              <strong>{data.summary.inProgressCount}</strong>
              <small>Aktif cikis sureci</small>
            </article>
            <article className="hr-offboarding-summary__card">
              <span>Bekleyen</span>
              <strong>{data.summary.pendingCount}</strong>
              <small>Planlama bekliyor</small>
            </article>
            <article className="hr-offboarding-summary__card">
              <span>Zimmet Riski</span>
              <strong>{data.summary.openAssetRiskCount}</strong>
              <small>Acik zimmeti olanlar</small>
            </article>
            <article className="hr-offboarding-summary__card">
              <span>Eksik Gorusme</span>
              <strong>{data.summary.missingInterviewCount}</strong>
              <small>Exit Interview kaydi yok</small>
            </article>
            <article className="hr-offboarding-summary__card">
              <span>Eksik Final</span>
              <strong>{data.summary.missingFinalSettlementCount}</strong>
              <small>Final kaydi yok</small>
            </article>
          </div>

          <section className="hr-offboarding-panel">
            <div className="hr-offboarding-panel__title">
              <div>
                <p className="eyebrow">Durum Dagilimi</p>
                <h2>Offboarding asamalari</h2>
              </div>
            </div>
            <div className="hr-offboarding-statuses">
              {data.statusSummary.length === 0 ? (
                <p className="hr-offboarding-state">Durum verisi bulunmuyor.</p>
              ) : (
                data.statusSummary.map((status) => (
                  <article className="hr-offboarding-status" key={status.key}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>{status.label}</span>
                    <strong>{status.count}</strong>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="hr-offboarding-panel">
            <div className="hr-offboarding-panel__title">
              <div>
                <p className="eyebrow">Kayit Listesi</p>
                <h2>Cikis surecindeki personel</h2>
              </div>
            </div>
            <div className="hr-offboarding-list">
              {data.items.length === 0 ? (
                <p className="hr-offboarding-state">Employee Separation kaydi bulunmuyor.</p>
              ) : (
                data.items.map((item) => (
                  <article className="hr-offboarding-item" key={item.id}>
                    <div>
                      <strong>{item.employeeName}</strong>
                      <small>
                        {item.employeeId} | {item.department} | {item.designation}
                      </small>
                      <small>
                        Ayrilis Talebi: {formatDate(item.separationDate)} | Fiili Ayrilis: {formatDate(item.relievingDate)} | Guncelleme:{" "}
                        {formatDate(item.updatedAt)}
                      </small>
                      <small>
                        Exit Interview: {item.interviewCount} | Final Kayit: {item.finalSettlementCount} | Acik Zimmet:{" "}
                        {item.openZimmetCount}
                      </small>
                      {item.riskNotes.length > 0 ? (
                        <div className="hr-offboarding-risks">
                          <ShieldAlert size={14} aria-hidden="true" />
                          <span>{item.riskNotes.join(" / ")}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="hr-offboarding-item__meta">
                      <em className={statusToneClass(item)}>{item.status}</em>
                      <LogOut size={16} aria-hidden="true" />
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
