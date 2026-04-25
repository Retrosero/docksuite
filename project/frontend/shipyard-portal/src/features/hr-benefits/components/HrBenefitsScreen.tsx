import { AlertTriangle, BadgePlus, Clock3, Gift, HandCoins, RefreshCw } from "lucide-react";
import { useHrBenefitsData } from "../hooks/useHrBenefitsData";
import type { HrAdditionalSalaryItem, HrBenefitApplicationItem, HrBenefitClaimItem } from "../types";

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

function statusToneClass(
  item:
    | Pick<HrBenefitApplicationItem, "statusTone">
    | Pick<HrBenefitClaimItem, "statusTone">
    | Pick<HrAdditionalSalaryItem, "statusTone">
) {
  if (item.statusTone === "positive") return "hr-benefits__badge--positive";
  if (item.statusTone === "warning") return "hr-benefits__badge--warning";
  if (item.statusTone === "negative") return "hr-benefits__badge--negative";
  return "hr-benefits__badge--neutral";
}

export function HrBenefitsScreen() {
  const { data, loading, error, refresh } = useHrBenefitsData();

  return (
    <section className="hr-benefits-screen">
      <header className="hr-benefits-hero">
        <div className="hr-benefits-hero__copy">
          <p className="eyebrow">Yan Haklar</p>
          <h1>Yan Haklar</h1>
          <p>Employee Benefit ve Additional Salary kayitlarini tek panelde izleyin.</p>
        </div>
        <button className="hr-benefits-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-benefits-state hr-benefits-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-benefits-state">
          <Clock3 size={18} aria-hidden="true" />
          <p>Yan haklar verisi yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="hr-benefits-summary">
            <article className="hr-benefits-summary__card">
              <span>Benefit Basvuru</span>
              <strong>{data.summary.totalBenefitApplicationCount}</strong>
              <small>Toplam basvuru</small>
            </article>
            <article className="hr-benefits-summary__card">
              <span>Benefit Talep</span>
              <strong>{data.summary.totalBenefitClaimCount}</strong>
              <small>Toplam claim</small>
            </article>
            <article className="hr-benefits-summary__card">
              <span>Ek Odeme/Kesinti</span>
              <strong>{data.summary.totalAdditionalSalaryCount}</strong>
              <small>Additional Salary kaydi</small>
            </article>
            <article className="hr-benefits-summary__card">
              <span>Bekleyen Basvuru</span>
              <strong>{data.summary.pendingBenefitApplicationCount}</strong>
              <small>Onay bekleyen</small>
            </article>
            <article className="hr-benefits-summary__card">
              <span>Bekleyen Claim</span>
              <strong>{data.summary.pendingBenefitClaimCount}</strong>
              <small>Onay bekleyen</small>
            </article>
            <article className="hr-benefits-summary__card">
              <span>Bekleyen Ek Odeme</span>
              <strong>{data.summary.pendingAdditionalSalaryCount}</strong>
              <small>Islem bekleyen</small>
            </article>
          </div>

          <div className="hr-benefits-layout">
            <section className="hr-benefits-panel">
              <div className="hr-benefits-panel__title">
                <div>
                  <p className="eyebrow">Benefit Basvuru</p>
                  <h2>Employee Benefit Application</h2>
                </div>
              </div>
              <div className="hr-benefits-list">
                {data.benefitApplications.length === 0 ? (
                  <p className="hr-benefits-state">Employee Benefit Application kaydi bulunmuyor.</p>
                ) : (
                  data.benefitApplications.map((item) => (
                    <article className="hr-benefits-item" key={item.id}>
                      <div>
                        <strong>{item.employeeName}</strong>
                        <small>
                          Sicil: {item.employeeId} | Benefit: {item.benefitType}
                        </small>
                        <small>
                          Donem: {item.payrollPeriod} | Guncelleme: {formatDate(item.updatedAt)}
                        </small>
                      </div>
                      <div className="hr-benefits-item__meta">
                        <em className={statusToneClass(item)}>{item.status}</em>
                        <Gift size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-benefits-panel">
              <div className="hr-benefits-panel__title">
                <div>
                  <p className="eyebrow">Benefit Claim</p>
                  <h2>Employee Benefit Claim</h2>
                </div>
              </div>
              <div className="hr-benefits-list">
                {data.benefitClaims.length === 0 ? (
                  <p className="hr-benefits-state">Employee Benefit Claim kaydi bulunmuyor.</p>
                ) : (
                  data.benefitClaims.map((item) => (
                    <article className="hr-benefits-item" key={item.id}>
                      <div>
                        <strong>{item.employeeName}</strong>
                        <small>
                          Sicil: {item.employeeId} | Kaynak: {item.benefitType}
                        </small>
                        <small>
                          Tutar: {item.claimAmountLabel} | Tarih: {formatDate(item.postingDate)} | Guncelleme:{" "}
                          {formatDate(item.updatedAt)}
                        </small>
                      </div>
                      <div className="hr-benefits-item__meta">
                        <em className={statusToneClass(item)}>{item.status}</em>
                        <HandCoins size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="hr-benefits-panel">
            <div className="hr-benefits-panel__title">
              <div>
                <p className="eyebrow">Ek Odeme/Kesinti</p>
                <h2>Additional Salary hareketleri</h2>
              </div>
            </div>
            <div className="hr-benefits-list">
              {data.additionalSalaries.length === 0 ? (
                <p className="hr-benefits-state">Additional Salary kaydi bulunmuyor.</p>
              ) : (
                data.additionalSalaries.map((item) => (
                  <article className="hr-benefits-item" key={item.id}>
                    <div>
                      <strong>{item.employeeName}</strong>
                      <small>
                        Sicil: {item.employeeId} | Komponent: {item.salaryComponent}
                      </small>
                      <small>
                        Tutar: {item.amountLabel} | Bordro Tarihi: {formatDate(item.payrollDate)} | Guncelleme:{" "}
                        {formatDate(item.updatedAt)}
                      </small>
                    </div>
                    <div className="hr-benefits-item__meta">
                      <em className={statusToneClass(item)}>{item.status}</em>
                      <BadgePlus size={16} aria-hidden="true" />
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
