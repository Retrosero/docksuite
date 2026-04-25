import { AlertTriangle, Clock3, RefreshCw, ShieldAlert, Sparkles, UserRoundCog } from "lucide-react";
import { useHrCompetencyData } from "../hooks/useHrCompetencyData";
import type { HrCompetencySkillTag } from "../types";

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

function proficiencyToneClass(skill: HrCompetencySkillTag) {
  if (skill.proficiencyTone === "positive") return "hr-competency__badge--positive";
  if (skill.proficiencyTone === "warning") return "hr-competency__badge--warning";
  return "hr-competency__badge--neutral";
}

export function HrCompetencyScreen() {
  const { data, loading, error, refresh } = useHrCompetencyData();

  return (
    <section className="hr-competency-screen">
      <header className="hr-competency-hero">
        <div className="hr-competency-hero__copy">
          <p className="eyebrow">Yetkinlik Matrisi</p>
          <h1>Yetkinlik Matrisi</h1>
          <p>Skill ve Employee Skill Map kayitlarindan pozisyon bazli yetkinlik dagilimini izleyin.</p>
        </div>
        <button className="hr-competency-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-competency-state hr-competency-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-competency-state">
          <Clock3 size={18} aria-hidden="true" />
          <p>Yetkinlik matrisi verisi yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="hr-competency-summary">
            <article className="hr-competency-summary__card">
              <span>Yetkinlik</span>
              <strong>{data.summary.totalSkills}</strong>
              <small>Aktif skill kaydi</small>
            </article>
            <article className="hr-competency-summary__card">
              <span>Harita Kaydi</span>
              <strong>{data.summary.totalMaps}</strong>
              <small>Employee Skill Map</small>
            </article>
            <article className="hr-competency-summary__card">
              <span>Eslesen Personel</span>
              <strong>{data.summary.mappedEmployeeCount}</strong>
              <small>Kimliklenen personel</small>
            </article>
            <article className="hr-competency-summary__card">
              <span>Yetkinlik Atamasi</span>
              <strong>{data.summary.totalAssignments}</strong>
              <small>Toplam skill atamasi</small>
            </article>
            <article className="hr-competency-summary__card">
              <span>Eksik Kayit</span>
              <strong>{data.summary.missingSkillEmployeeCount}</strong>
              <small>Skill satiri olmayan personel</small>
            </article>
          </div>

          <div className="hr-competency-layout">
            <section className="hr-competency-panel">
              <div className="hr-competency-panel__title">
                <div>
                  <p className="eyebrow">Pozisyon Dagilimi</p>
                  <h2>Rol bazli yetkinlik yogunlugu</h2>
                </div>
              </div>
              <div className="hr-competency-role-list">
                {data.roleSummary.length === 0 ? (
                  <p className="hr-competency-state">Pozisyon ozet verisi bulunmuyor.</p>
                ) : (
                  data.roleSummary.map((item) => (
                    <article className="hr-competency-role" key={item.key}>
                      <UserRoundCog size={15} aria-hidden="true" />
                      <span>{item.label}</span>
                      <small>
                        Personel: {item.employeeCount} | Atama: {item.assignmentCount}
                      </small>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-competency-panel">
              <div className="hr-competency-panel__title">
                <div>
                  <p className="eyebrow">Kapsam</p>
                  <h2>En cok atanan yetkinlikler</h2>
                </div>
              </div>
              <div className="hr-competency-coverage-list">
                {data.topSkillCoverage.length === 0 ? (
                  <p className="hr-competency-state">Skill coverage verisi bulunmuyor.</p>
                ) : (
                  data.topSkillCoverage.map((skill) => (
                    <article className="hr-competency-coverage" key={skill.skillId}>
                      <Sparkles size={14} aria-hidden="true" />
                      <span>{skill.skillName}</span>
                      <strong>{skill.employeeCount}</strong>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="hr-competency-panel">
            <div className="hr-competency-panel__title">
              <div>
                <p className="eyebrow">Matris Detayi</p>
                <h2>Personel yetkinlik kartlari</h2>
              </div>
            </div>
            <div className="hr-competency-employee-list">
              {data.employees.length === 0 ? (
                <p className="hr-competency-state">Employee Skill Map kaydi bulunmuyor.</p>
              ) : (
                data.employees.map((row) => (
                  <article className="hr-competency-employee" key={row.mapId}>
                    <div>
                      <strong>{row.employeeName}</strong>
                      <small>
                        Sicil: {row.employeeId} | Departman: {row.department} | Unvan: {row.designation}
                      </small>
                      <small>Guncelleme: {formatDate(row.updatedAt)}</small>
                      {row.skills.length > 0 ? (
                        <div className="hr-competency-skill-tags">
                          {row.skills.slice(0, 6).map((skill) => (
                            <span className={`hr-competency-skill-tag ${proficiencyToneClass(skill)}`} key={`${row.mapId}-${skill.skillId}`}>
                              {skill.skillName} · {skill.proficiencyLabel}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="hr-competency-risks">
                          <ShieldAlert size={14} aria-hidden="true" />
                          <span>Bu kayitta skill satiri bulunmuyor.</span>
                        </div>
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
