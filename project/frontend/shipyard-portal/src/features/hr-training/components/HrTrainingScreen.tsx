import { AlertTriangle, Award, BookOpenCheck, Clock3, RefreshCw, ShieldAlert, UserCheck } from "lucide-react";
import { useHrTrainingData } from "../hooks/useHrTrainingData";
import type { HrTrainingResultItem } from "../types";

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

function resultToneClass(item: HrTrainingResultItem) {
  if (item.resultTone === "positive") return "hr-training__badge--positive";
  if (item.resultTone === "warning") return "hr-training__badge--warning";
  if (item.resultTone === "negative") return "hr-training__badge--negative";
  return "hr-training__badge--neutral";
}

export function HrTrainingScreen() {
  const { data, loading, error, refresh } = useHrTrainingData();

  return (
    <section className="hr-training-screen">
      <header className="hr-training-hero">
        <div className="hr-training-hero__copy">
          <p className="eyebrow">Egitim ve Sertifika</p>
          <h1>Egitim ve Sertifika</h1>
          <p>Training Program, Event, Result ve personel sertifika risklerini tek panelde izleyin.</p>
        </div>
        <button className="hr-training-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-training-state hr-training-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-training-state">
          <Clock3 size={18} aria-hidden="true" />
          <p>Egitim ve sertifika verisi yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="hr-training-summary">
            <article className="hr-training-summary__card">
              <span>Program</span>
              <strong>{data.summary.totalPrograms}</strong>
              <small>Toplam egitim programi</small>
            </article>
            <article className="hr-training-summary__card">
              <span>Etkinlik</span>
              <strong>{data.summary.totalEvents}</strong>
              <small>Planlanan egitim etkinligi</small>
            </article>
            <article className="hr-training-summary__card">
              <span>Sonuc</span>
              <strong>{data.summary.totalResults}</strong>
              <small>Degerlendirme kaydi</small>
            </article>
            <article className="hr-training-summary__card">
              <span>Geri Bildirim</span>
              <strong>{data.summary.totalFeedback}</strong>
              <small>Training Feedback kaydi</small>
            </article>
            <article className="hr-training-summary__card">
              <span>Sertifika Riski</span>
              <strong>{data.summary.certificateCount}</strong>
              <small>Suresi dolan/yaklasan</small>
            </article>
            <article className="hr-training-summary__card">
              <span>Yaklasan Sertifika</span>
              <strong>{data.summary.expiringCertificateCount}</strong>
              <small>Yenileme takip gerektirir</small>
            </article>
          </div>

          <div className="hr-training-layout">
            <section className="hr-training-panel">
              <div className="hr-training-panel__title">
                <div>
                  <p className="eyebrow">Takvim</p>
                  <h2>Son egitim etkinlikleri</h2>
                </div>
              </div>
              <div className="hr-training-list">
                {data.events.length === 0 ? (
                  <p className="hr-training-state">Training Event kaydi bulunmuyor.</p>
                ) : (
                  data.events.map((event) => (
                    <article className="hr-training-item" key={event.id}>
                      <div>
                        <strong>{event.title}</strong>
                        <small>Program: {event.programName}</small>
                        <small>
                          Baslangic: {formatDate(event.startDate)} | Bitis: {formatDate(event.endDate)}
                        </small>
                      </div>
                      <div className="hr-training-item__meta">
                        <em className="hr-training__badge--neutral">{event.status}</em>
                        <BookOpenCheck size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-training-panel">
              <div className="hr-training-panel__title">
                <div>
                  <p className="eyebrow">Sonuclar</p>
                  <h2>Katilimci degerlendirmeleri</h2>
                </div>
              </div>
              <div className="hr-training-list">
                {data.results.length === 0 ? (
                  <p className="hr-training-state">Training Result kaydi bulunmuyor.</p>
                ) : (
                  data.results.map((result) => (
                    <article className="hr-training-item" key={result.id}>
                      <div>
                        <strong>{result.employeeName}</strong>
                        <small>
                          Sicil: {result.employeeId} | Etkinlik: {result.eventId}
                        </small>
                        <small>
                          Sonuc: {result.resultLabel} | Skor: {result.scoreLabel} | Guncelleme:{" "}
                          {formatDate(result.updatedAt)}
                        </small>
                      </div>
                      <div className="hr-training-item__meta">
                        <em className={resultToneClass(result)}>{result.resultLabel}</em>
                        <UserCheck size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="hr-training-panel">
            <div className="hr-training-panel__title">
              <div>
                <p className="eyebrow">Sertifika Riski</p>
                <h2>Suresi dolan veya yaklasan belgeler</h2>
              </div>
            </div>
            <div className="hr-training-list">
              {data.certificateRisks.length === 0 ? (
                <p className="hr-training-state">Riskli sertifika kaydi bulunmuyor.</p>
              ) : (
                data.certificateRisks.map((certificate) => (
                  <article className="hr-training-item" key={certificate.id}>
                    <div>
                      <strong>{certificate.employeeName}</strong>
                      <small>
                        Sicil: {certificate.employeeId} | Belge: {certificate.documentType}
                      </small>
                      <small>Gecerlilik: {formatDate(certificate.expiryDate)}</small>
                    </div>
                    <div className="hr-training-item__meta">
                      <em className={certificate.status === "Suresi Doldu" ? "hr-training__badge--negative" : "hr-training__badge--warning"}>
                        {certificate.status}
                      </em>
                      {certificate.status === "Suresi Doldu" ? (
                        <ShieldAlert size={16} aria-hidden="true" />
                      ) : (
                        <Award size={16} aria-hidden="true" />
                      )}
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
