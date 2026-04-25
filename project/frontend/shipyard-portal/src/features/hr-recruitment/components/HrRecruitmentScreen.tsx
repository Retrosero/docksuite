import { AlertTriangle, BriefcaseBusiness, RefreshCw, Users } from "lucide-react";
import { useHrRecruitmentData } from "../hooks/useHrRecruitmentData";
import type { HrRecruitmentApplicantItem, HrRecruitmentOpeningItem } from "../types";

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

function applicantToneClass(item: HrRecruitmentApplicantItem) {
  if (item.statusTone === "positive") return "hr-recruitment__badge--positive";
  if (item.statusTone === "warning") return "hr-recruitment__badge--warning";
  if (item.statusTone === "negative") return "hr-recruitment__badge--negative";
  return "hr-recruitment__badge--neutral";
}

function RecruitmentSummaryCards({
  summary
}: {
  summary: { totalOpenings: number; openOpenings: number; totalApplicants: number; recentApplicants: number };
}) {
  return (
    <div className="hr-recruitment-summary">
      <article className="hr-recruitment-summary__card">
        <span>Toplam Pozisyon</span>
        <strong>{summary.totalOpenings}</strong>
        <small>Aday aciklari</small>
      </article>
      <article className="hr-recruitment-summary__card">
        <span>Acik Pozisyon</span>
        <strong>{summary.openOpenings}</strong>
        <small>Yayinda/aktif alim</small>
      </article>
      <article className="hr-recruitment-summary__card">
        <span>Toplam Aday</span>
        <strong>{summary.totalApplicants}</strong>
        <small>Havuzdaki basvurular</small>
      </article>
      <article className="hr-recruitment-summary__card">
        <span>Son 7 Gun</span>
        <strong>{summary.recentApplicants}</strong>
        <small>Yeni basvuru</small>
      </article>
    </div>
  );
}

function OpeningList({ openings }: { openings: HrRecruitmentOpeningItem[] }) {
  return (
    <section className="hr-recruitment-panel">
      <div className="hr-recruitment-panel__title">
        <div>
          <p className="eyebrow">Pozisyonlar</p>
          <h2>Acik kadro listesi</h2>
        </div>
      </div>
      <div className="hr-recruitment-list">
        {openings.length === 0 ? (
          <p className="hr-recruitment-state">Pozisyon kaydi bulunmuyor.</p>
        ) : (
          openings.map((opening) => (
            <article className="hr-recruitment-item" key={opening.id}>
              <div>
                <strong>{opening.title}</strong>
                <small>
                  {opening.department} | {opening.designation}
                </small>
                <small>
                  Yayin: {formatDate(opening.publishedOn)} | Kapanis: {formatDate(opening.closingDate)}
                </small>
              </div>
              <div className="hr-recruitment-item__meta">
                <em>{opening.status}</em>
                <span>{opening.applicantCount} aday</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ApplicantList({ applicants }: { applicants: HrRecruitmentApplicantItem[] }) {
  return (
    <section className="hr-recruitment-panel">
      <div className="hr-recruitment-panel__title">
        <div>
          <p className="eyebrow">Adaylar</p>
          <h2>Basvuru havuzu</h2>
        </div>
      </div>
      <div className="hr-recruitment-list">
        {applicants.length === 0 ? (
          <p className="hr-recruitment-state">Aday kaydi bulunmuyor.</p>
        ) : (
          applicants.slice(0, 24).map((applicant) => (
            <article className="hr-recruitment-item" key={applicant.id}>
              <div>
                <strong>{applicant.fullName}</strong>
                <small>{applicant.email}</small>
                <small>
                  {applicant.jobOpeningTitle} | Kaynak: {applicant.source}
                </small>
              </div>
              <div className="hr-recruitment-item__meta">
                <em className={applicantToneClass(applicant)}>{applicant.status}</em>
                <span>{formatDate(applicant.appliedOn)}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function HrRecruitmentScreen() {
  const { data, loading, error, refresh } = useHrRecruitmentData();

  return (
    <section className="hr-recruitment-screen">
      <header className="hr-recruitment-hero">
        <div className="hr-recruitment-hero__copy">
          <p className="eyebrow">Aday Takip</p>
          <h1>Aday Takip</h1>
          <p>Standart ERPNext Job Opening ve Job Applicant kayitlariyla IK alim surecini sade bir ekranda izleyin.</p>
        </div>
        <button className="hr-recruitment-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-recruitment-state hr-recruitment-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-recruitment-state">
          <BriefcaseBusiness size={18} aria-hidden="true" />
          <p>Aday takip verisi yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          <RecruitmentSummaryCards summary={data.summary} />

          <section className="hr-recruitment-panel">
            <div className="hr-recruitment-panel__title">
              <div>
                <p className="eyebrow">Asamalar</p>
                <h2>Aday asama dagilimi</h2>
              </div>
            </div>
            <div className="hr-recruitment-stages">
              {data.stageSummary.length === 0 ? (
                <p className="hr-recruitment-state">Asama verisi bulunmuyor.</p>
              ) : (
                data.stageSummary.map((stage) => (
                  <article className="hr-recruitment-stage" key={stage.key}>
                    <Users size={16} aria-hidden="true" />
                    <span>{stage.label}</span>
                    <strong>{stage.count}</strong>
                  </article>
                ))
              )}
            </div>
          </section>

          <div className="hr-recruitment-layout">
            <OpeningList openings={data.openings} />
            <ApplicantList applicants={data.applicants} />
          </div>
        </>
      ) : null}
    </section>
  );
}
