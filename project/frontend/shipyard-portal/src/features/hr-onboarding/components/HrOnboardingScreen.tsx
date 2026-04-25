import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, ShieldAlert, UserPlus } from "lucide-react";
import { useHrOnboardingData } from "../hooks/useHrOnboardingData";
import type { HrOnboardingItem } from "../types";

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

function statusToneClass(item: HrOnboardingItem) {
  if (item.statusTone === "positive") return "hr-onboarding__badge--positive";
  if (item.statusTone === "warning") return "hr-onboarding__badge--warning";
  if (item.statusTone === "negative") return "hr-onboarding__badge--negative";
  return "hr-onboarding__badge--neutral";
}

export function HrOnboardingScreen() {
  const { data, loading, error, refresh } = useHrOnboardingData();

  return (
    <section className="hr-onboarding-screen">
      <header className="hr-onboarding-hero">
        <div className="hr-onboarding-hero__copy">
          <p className="eyebrow">Ise Giris Sureci</p>
          <h1>Ise Giris Sureci</h1>
          <p>Standart Employee Onboarding kayitlarini personel belge ve zimmet durumu ile birlikte izleyin.</p>
        </div>
        <button className="hr-onboarding-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-onboarding-state hr-onboarding-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-onboarding-state">
          <Clock3 size={18} aria-hidden="true" />
          <p>Ise giris sureci verisi yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="hr-onboarding-summary">
            <article className="hr-onboarding-summary__card">
              <span>Toplam Kayit</span>
              <strong>{data.summary.totalRecords}</strong>
              <small>Onboarding sureci</small>
            </article>
            <article className="hr-onboarding-summary__card">
              <span>Tamamlanan</span>
              <strong>{data.summary.completedCount}</strong>
              <small>Sureci bitenler</small>
            </article>
            <article className="hr-onboarding-summary__card">
              <span>Devam Eden</span>
              <strong>{data.summary.inProgressCount}</strong>
              <small>Aktif onboarding</small>
            </article>
            <article className="hr-onboarding-summary__card">
              <span>Bekleyen</span>
              <strong>{data.summary.pendingCount}</strong>
              <small>Planlama bekliyor</small>
            </article>
            <article className="hr-onboarding-summary__card">
              <span>Yaklasan Ise Giris</span>
              <strong>{data.summary.joiningSoonCount}</strong>
              <small>7 gun icinde</small>
            </article>
            <article className="hr-onboarding-summary__card">
              <span>Belge Riski</span>
              <strong>{data.summary.documentRiskCount}</strong>
              <small>Belgesi eksik personel</small>
            </article>
            <article className="hr-onboarding-summary__card">
              <span>Zimmet Riski</span>
              <strong>{data.summary.assetRiskCount}</strong>
              <small>Acik zimmeti olanlar</small>
            </article>
          </div>

          <section className="hr-onboarding-panel">
            <div className="hr-onboarding-panel__title">
              <div>
                <p className="eyebrow">Durum Dagilimi</p>
                <h2>Onboarding asamalari</h2>
              </div>
            </div>
            <div className="hr-onboarding-statuses">
              {data.statusSummary.length === 0 ? (
                <p className="hr-onboarding-state">Durum verisi bulunmuyor.</p>
              ) : (
                data.statusSummary.map((status) => (
                  <article className="hr-onboarding-status" key={status.key}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>{status.label}</span>
                    <strong>{status.count}</strong>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="hr-onboarding-panel">
            <div className="hr-onboarding-panel__title">
              <div>
                <p className="eyebrow">Kayit Listesi</p>
                <h2>Ise baslayacak personel</h2>
              </div>
            </div>
            <div className="hr-onboarding-list">
              {data.items.length === 0 ? (
                <p className="hr-onboarding-state">Onboarding kaydi bulunmuyor.</p>
              ) : (
                data.items.map((item) => (
                  <article className="hr-onboarding-item" key={item.id}>
                    <div>
                      <strong>{item.employeeName}</strong>
                      <small>
                        {item.employeeId} | {item.department} | {item.designation}
                      </small>
                      <small>
                        Baslangic: {formatDate(item.startDate)} | Ise Giris: {formatDate(item.joinDate)} | Guncelleme:{" "}
                        {formatDate(item.updatedAt)}
                      </small>
                      <small>Belge: {item.documentCount} | Acik Zimmet: {item.openZimmetCount}</small>
                      {item.riskNotes.length > 0 ? (
                        <div className="hr-onboarding-risks">
                          <ShieldAlert size={14} aria-hidden="true" />
                          <span>{item.riskNotes.join(" / ")}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="hr-onboarding-item__meta">
                      <em className={statusToneClass(item)}>{item.status}</em>
                      <UserPlus size={16} aria-hidden="true" />
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
