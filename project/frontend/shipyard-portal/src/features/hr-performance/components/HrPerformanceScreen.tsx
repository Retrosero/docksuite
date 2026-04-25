import { AlertTriangle, Clock3, Goal, MessageSquareText, RefreshCw, Trophy } from "lucide-react";
import { useHrPerformanceData } from "../hooks/useHrPerformanceData";
import type { HrAppraisalItem, HrGoalItem } from "../types";

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

function statusToneClass(item: Pick<HrGoalItem, "statusTone"> | Pick<HrAppraisalItem, "statusTone">) {
  if (item.statusTone === "positive") return "hr-performance__badge--positive";
  if (item.statusTone === "warning") return "hr-performance__badge--warning";
  if (item.statusTone === "negative") return "hr-performance__badge--negative";
  return "hr-performance__badge--neutral";
}

export function HrPerformanceScreen() {
  const { data, loading, error, refresh } = useHrPerformanceData();

  return (
    <section className="hr-performance-screen">
      <header className="hr-performance-hero">
        <div className="hr-performance-hero__copy">
          <p className="eyebrow">Performans</p>
          <h1>Performans</h1>
          <p>Goal, Appraisal Cycle, Appraisal ve performans geri bildirim kayitlarini bir arada izleyin.</p>
        </div>
        <button className="hr-performance-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-performance-state hr-performance-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-performance-state">
          <Clock3 size={18} aria-hidden="true" />
          <p>Performans verisi yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="hr-performance-summary">
            <article className="hr-performance-summary__card">
              <span>Hedef</span>
              <strong>{data.summary.totalGoalCount}</strong>
              <small>Toplam goal kaydi</small>
            </article>
            <article className="hr-performance-summary__card">
              <span>Degerlendirme Donemi</span>
              <strong>{data.summary.totalCycleCount}</strong>
              <small>Appraisal cycle kaydi</small>
            </article>
            <article className="hr-performance-summary__card">
              <span>Appraisal</span>
              <strong>{data.summary.totalAppraisalCount}</strong>
              <small>Toplam appraisal kaydi</small>
            </article>
            <article className="hr-performance-summary__card">
              <span>Geri Bildirim</span>
              <strong>{data.summary.totalFeedbackCount}</strong>
              <small>Performance feedback kaydi</small>
            </article>
            <article className="hr-performance-summary__card">
              <span>Bekleyen Hedef</span>
              <strong>{data.summary.pendingGoalCount}</strong>
              <small>Takip bekleyen goal</small>
            </article>
            <article className="hr-performance-summary__card">
              <span>Bekleyen Appraisal</span>
              <strong>{data.summary.pendingAppraisalCount}</strong>
              <small>Sonuclanmamis degerlendirme</small>
            </article>
          </div>

          <div className="hr-performance-layout">
            <section className="hr-performance-panel">
              <div className="hr-performance-panel__title">
                <div>
                  <p className="eyebrow">Hedefler</p>
                  <h2>Goal listesi</h2>
                </div>
              </div>
              <div className="hr-performance-list">
                {data.goals.length === 0 ? (
                  <p className="hr-performance-state">Goal kaydi bulunmuyor.</p>
                ) : (
                  data.goals.map((item) => (
                    <article className="hr-performance-item" key={item.id}>
                      <div>
                        <strong>{item.employeeName}</strong>
                        <small>
                          Sicil: {item.employeeId} | Hedef: {item.subject}
                        </small>
                        <small>
                          Ilerleme: {item.progressLabel} | Guncelleme: {formatDate(item.updatedAt)}
                        </small>
                      </div>
                      <div className="hr-performance-item__meta">
                        <em className={statusToneClass(item)}>{item.status}</em>
                        <Goal size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-performance-panel">
              <div className="hr-performance-panel__title">
                <div>
                  <p className="eyebrow">Degerlendirme Donemi</p>
                  <h2>Appraisal cycle listesi</h2>
                </div>
              </div>
              <div className="hr-performance-list">
                {data.cycles.length === 0 ? (
                  <p className="hr-performance-state">Appraisal Cycle kaydi bulunmuyor.</p>
                ) : (
                  data.cycles.map((item) => (
                    <article className="hr-performance-item" key={item.id}>
                      <div>
                        <strong>{item.title}</strong>
                        <small>
                          Baslangic: {formatDate(item.startDate)} | Bitis: {formatDate(item.endDate)}
                        </small>
                        <small>Durum: {item.status}</small>
                      </div>
                      <div className="hr-performance-item__meta">
                        <em className="hr-performance__badge--neutral">{item.status}</em>
                        <Trophy size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="hr-performance-layout">
            <section className="hr-performance-panel">
              <div className="hr-performance-panel__title">
                <div>
                  <p className="eyebrow">Appraisal</p>
                  <h2>Personel degerlendirmeleri</h2>
                </div>
              </div>
              <div className="hr-performance-list">
                {data.appraisals.length === 0 ? (
                  <p className="hr-performance-state">Appraisal kaydi bulunmuyor.</p>
                ) : (
                  data.appraisals.map((item) => (
                    <article className="hr-performance-item" key={item.id}>
                      <div>
                        <strong>{item.employeeName}</strong>
                        <small>
                          Sicil: {item.employeeId} | Donem: {item.cycleName}
                        </small>
                        <small>
                          Skor: {item.scoreLabel} | Guncelleme: {formatDate(item.updatedAt)}
                        </small>
                      </div>
                      <div className="hr-performance-item__meta">
                        <em className={statusToneClass(item)}>{item.status}</em>
                        <Trophy size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-performance-panel">
              <div className="hr-performance-panel__title">
                <div>
                  <p className="eyebrow">Geri Bildirim</p>
                  <h2>Performance feedback listesi</h2>
                </div>
              </div>
              <div className="hr-performance-list">
                {data.feedbacks.length === 0 ? (
                  <p className="hr-performance-state">Employee Performance Feedback kaydi bulunmuyor.</p>
                ) : (
                  data.feedbacks.map((item) => (
                    <article className="hr-performance-item" key={item.id}>
                      <div>
                        <strong>{item.employeeName}</strong>
                        <small>
                          Sicil: {item.employeeId} | Referans: {item.referenceLabel}
                        </small>
                        <small>{item.feedbackSnippet}</small>
                        <small>Guncelleme: {formatDate(item.updatedAt)}</small>
                      </div>
                      <div className="hr-performance-item__meta">
                        <MessageSquareText size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}
