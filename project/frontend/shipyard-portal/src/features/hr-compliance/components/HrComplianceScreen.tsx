import { AlertTriangle, Clock3, FileWarning, RefreshCw, ShieldAlert } from "lucide-react";
import { useHrComplianceData } from "../hooks/useHrComplianceData";
import type { HrHealthInsuranceRiskItem } from "../types";

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

function statusToneClass(item: Pick<HrHealthInsuranceRiskItem, "statusTone">) {
  if (item.statusTone === "positive") return "hr-compliance__badge--positive";
  if (item.statusTone === "warning") return "hr-compliance__badge--warning";
  if (item.statusTone === "negative") return "hr-compliance__badge--negative";
  return "hr-compliance__badge--neutral";
}

export function HrComplianceScreen() {
  const { data, loading, error, refresh } = useHrComplianceData();

  return (
    <section className="hr-compliance-screen">
      <header className="hr-compliance-hero">
        <div className="hr-compliance-hero__copy">
          <p className="eyebrow">Uygunluk Takibi</p>
          <h1>Uygunluk Takibi</h1>
          <p>Saglik sigortasi ve zorunlu belge gecerlilik risklerini tek panelde izleyin.</p>
        </div>
        <button className="hr-compliance-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-compliance-state hr-compliance-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-compliance-state">
          <Clock3 size={18} aria-hidden="true" />
          <p>Uygunluk verisi yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="hr-compliance-summary">
            <article className="hr-compliance-summary__card">
              <span>Saglik Sigortasi</span>
              <strong>{data.summary.totalHealthInsuranceCount}</strong>
              <small>Toplam sigorta kaydi</small>
            </article>
            <article className="hr-compliance-summary__card">
              <span>Sigorta Riski</span>
              <strong>{data.summary.healthInsuranceRiskCount}</strong>
              <small>Dolmus/yaklasan poliçe</small>
            </article>
            <article className="hr-compliance-summary__card">
              <span>Belge Riski</span>
              <strong>{data.summary.documentRiskCount}</strong>
              <small>Zorunlu belge uyum riski</small>
            </article>
            <article className="hr-compliance-summary__card">
              <span>Sigortasiz Personel</span>
              <strong>{data.summary.missingHealthInsuranceEmployeeCount}</strong>
              <small>Aktif personel icinde eksik</small>
            </article>
          </div>

          <div className="hr-compliance-layout">
            <section className="hr-compliance-panel">
              <div className="hr-compliance-panel__title">
                <div>
                  <p className="eyebrow">Saglik Sigortasi Riski</p>
                  <h2>Dolmus veya yaklasan police kayitlari</h2>
                </div>
              </div>
              <div className="hr-compliance-list">
                {data.healthInsuranceRisks.length === 0 ? (
                  <p className="hr-compliance-state">Saglik sigortasi riski bulunmuyor.</p>
                ) : (
                  data.healthInsuranceRisks.map((item) => (
                    <article className="hr-compliance-item" key={item.id}>
                      <div>
                        <strong>{item.employeeName}</strong>
                        <small>
                          Sicil: {item.employeeId} | Sirket: {item.provider} | Police: {item.policyNumber}
                        </small>
                        <small>
                          Baslangic: {formatDate(item.validFrom)} | Bitis: {formatDate(item.validTo)}
                        </small>
                      </div>
                      <div className="hr-compliance-item__meta">
                        <em className={statusToneClass(item)}>{item.status}</em>
                        <ShieldAlert size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-compliance-panel">
              <div className="hr-compliance-panel__title">
                <div>
                  <p className="eyebrow">Belge Uyum Riski</p>
                  <h2>Zorunlu belge gecerlilik takibi</h2>
                </div>
              </div>
              <div className="hr-compliance-list">
                {data.documentRisks.length === 0 ? (
                  <p className="hr-compliance-state">Belge uyum riski kaydi bulunmuyor.</p>
                ) : (
                  data.documentRisks.map((item) => (
                    <article className="hr-compliance-item" key={item.id}>
                      <div>
                        <strong>{item.employeeName}</strong>
                        <small>
                          Sicil: {item.employeeId} | Belge: {item.documentType}
                        </small>
                        <small>
                          Durum: {item.status} | Gecerlilik: {formatDate(item.expiryDate)}
                        </small>
                      </div>
                      <div className="hr-compliance-item__meta">
                        <FileWarning size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="hr-compliance-panel">
            <div className="hr-compliance-panel__title">
              <div>
                <p className="eyebrow">Sigorta Kaydi Eksik</p>
                <h2>Aktif personelde kaydi olmayanlar</h2>
              </div>
            </div>
            <div className="hr-compliance-list">
              {data.missingCoverageEmployees.length === 0 ? (
                <p className="hr-compliance-state">Eksik sigorta kaydi bulunmuyor.</p>
              ) : (
                data.missingCoverageEmployees.map((item) => (
                  <article className="hr-compliance-item" key={item.employeeId}>
                    <div>
                      <strong>{item.employeeName}</strong>
                      <small>
                        Sicil: {item.employeeId} | Departman: {item.department} | Unvan: {item.designation}
                      </small>
                      <small>{item.reason}</small>
                    </div>
                    <div className="hr-compliance-item__meta">
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
