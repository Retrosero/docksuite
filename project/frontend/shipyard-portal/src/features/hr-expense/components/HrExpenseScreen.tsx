import { AlertTriangle, Clock3, CreditCard, Plane, ReceiptText, RefreshCw } from "lucide-react";
import { useHrExpenseData } from "../hooks/useHrExpenseData";
import type { HrAdvanceItem, HrExpenseClaimItem, HrTravelRequestItem } from "../types";

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
  item: Pick<HrAdvanceItem, "statusTone"> | Pick<HrExpenseClaimItem, "statusTone"> | Pick<HrTravelRequestItem, "statusTone">
) {
  if (item.statusTone === "positive") return "hr-expense__badge--positive";
  if (item.statusTone === "warning") return "hr-expense__badge--warning";
  if (item.statusTone === "negative") return "hr-expense__badge--negative";
  return "hr-expense__badge--neutral";
}

export function HrExpenseScreen() {
  const { data, loading, error, refresh } = useHrExpenseData();

  return (
    <section className="hr-expense-screen">
      <header className="hr-expense-hero">
        <div className="hr-expense-hero__copy">
          <p className="eyebrow">Avans ve Masraf</p>
          <h1>Avans ve Masraf</h1>
          <p>Employee Advance, Expense Claim ve Travel Request taleplerini tek panelde izleyin.</p>
        </div>
        <button className="hr-expense-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-expense-state hr-expense-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-expense-state">
          <Clock3 size={18} aria-hidden="true" />
          <p>Avans ve masraf verisi yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="hr-expense-summary">
            <article className="hr-expense-summary__card">
              <span>Avans</span>
              <strong>{data.summary.totalAdvanceCount}</strong>
              <small>Toplam avans talebi</small>
            </article>
            <article className="hr-expense-summary__card">
              <span>Masraf</span>
              <strong>{data.summary.totalExpenseClaimCount}</strong>
              <small>Toplam masraf talebi</small>
            </article>
            <article className="hr-expense-summary__card">
              <span>Seyahat</span>
              <strong>{data.summary.totalTravelRequestCount}</strong>
              <small>Toplam seyahat talebi</small>
            </article>
            <article className="hr-expense-summary__card">
              <span>Bekleyen Avans</span>
              <strong>{data.summary.pendingAdvanceCount}</strong>
              <small>Onay bekleyen avans</small>
            </article>
            <article className="hr-expense-summary__card">
              <span>Bekleyen Masraf</span>
              <strong>{data.summary.pendingExpenseClaimCount}</strong>
              <small>Onay bekleyen masraf</small>
            </article>
            <article className="hr-expense-summary__card">
              <span>Bekleyen Seyahat</span>
              <strong>{data.summary.pendingTravelRequestCount}</strong>
              <small>Onay bekleyen seyahat</small>
            </article>
          </div>

          <div className="hr-expense-layout">
            <section className="hr-expense-panel">
              <div className="hr-expense-panel__title">
                <div>
                  <p className="eyebrow">Avans Talepleri</p>
                  <h2>Son avans hareketleri</h2>
                </div>
              </div>
              <div className="hr-expense-list">
                {data.advances.length === 0 ? (
                  <p className="hr-expense-state">Employee Advance kaydi bulunmuyor.</p>
                ) : (
                  data.advances.map((item) => (
                    <article className="hr-expense-item" key={item.id}>
                      <div>
                        <strong>{item.employeeName}</strong>
                        <small>
                          Sicil: {item.employeeId} | Tutar: {item.amountLabel}
                        </small>
                        <small>
                          Neden: {item.purpose} | Talep Tarihi: {formatDate(item.postingDate)} | Guncelleme:{" "}
                          {formatDate(item.updatedAt)}
                        </small>
                      </div>
                      <div className="hr-expense-item__meta">
                        <em className={statusToneClass(item)}>{item.status}</em>
                        <CreditCard size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-expense-panel">
              <div className="hr-expense-panel__title">
                <div>
                  <p className="eyebrow">Masraf Talepleri</p>
                  <h2>Son masraf hareketleri</h2>
                </div>
              </div>
              <div className="hr-expense-list">
                {data.expenseClaims.length === 0 ? (
                  <p className="hr-expense-state">Expense Claim kaydi bulunmuyor.</p>
                ) : (
                  data.expenseClaims.map((item) => (
                    <article className="hr-expense-item" key={item.id}>
                      <div>
                        <strong>{item.employeeName}</strong>
                        <small>
                          Sicil: {item.employeeId} | Talep: {item.claimAmountLabel} | Onay: {item.sanctionedAmountLabel}
                        </small>
                        <small>
                          Neden: {item.purpose} | Talep Tarihi: {formatDate(item.postingDate)} | Guncelleme:{" "}
                          {formatDate(item.updatedAt)}
                        </small>
                      </div>
                      <div className="hr-expense-item__meta">
                        <em className={statusToneClass(item)}>{item.status}</em>
                        <ReceiptText size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="hr-expense-panel">
            <div className="hr-expense-panel__title">
              <div>
                <p className="eyebrow">Seyahat Talepleri</p>
                <h2>Seyahat onay kuyrugu</h2>
              </div>
            </div>
            <div className="hr-expense-list">
              {data.travelRequests.length === 0 ? (
                <p className="hr-expense-state">Travel Request kaydi bulunmuyor.</p>
              ) : (
                data.travelRequests.map((item) => (
                  <article className="hr-expense-item" key={item.id}>
                    <div>
                      <strong>{item.employeeName}</strong>
                      <small>
                        Sicil: {item.employeeId} | Neden: {item.purpose}
                      </small>
                      <small>
                        Baslangic: {formatDate(item.fromDate)} | Bitis: {formatDate(item.toDate)} | Guncelleme:{" "}
                        {formatDate(item.updatedAt)}
                      </small>
                    </div>
                    <div className="hr-expense-item__meta">
                      <em className={statusToneClass(item)}>{item.status}</em>
                      <Plane size={16} aria-hidden="true" />
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
