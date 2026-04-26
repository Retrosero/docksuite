import { AlertTriangle, CalendarClock, CreditCard, FileWarning, RefreshCw, Wallet } from "lucide-react";
import { useHrSelfServiceData } from "../hooks/useHrSelfServiceData";

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

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
    maximumFractionDigits: 2
  }).format(value || 0);
}

export function HrSelfServiceScreen() {
  const { data, loading, error, refresh } = useHrSelfServiceData();

  return (
    <section className="hr-self-screen">
      <header className="hr-self-hero">
        <div className="hr-self-hero__copy">
          <p className="eyebrow">Calisan Paneli</p>
          <h1>Calisan Paneli</h1>
          <p>Profil, izin, masraf, bordro ve belge durumunu tek ekranda takip edin.</p>
        </div>
        <button className="hr-self-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-self-state hr-self-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-self-state">
          <CalendarClock size={18} aria-hidden="true" />
          <p>Calisan paneli yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          {data.infoMessage ? (
            <div className="hr-self-state">
              <AlertTriangle size={18} aria-hidden="true" />
              <p>{data.infoMessage}</p>
            </div>
          ) : null}

          {data.profile ? (
            <section className="hr-self-profile">
              <h2>{data.profile.employeeName}</h2>
              <p>
                Sicil: {data.profile.employeeId} | Departman: {data.profile.department} | Unvan: {data.profile.designation}
              </p>
              <p>
                Durum: {data.profile.status} | Ise giris: {formatDate(data.profile.joiningDate)}
              </p>
            </section>
          ) : null}

          <div className="hr-self-summary">
            <article className="hr-self-summary__card">
              <span>Son Attendance</span>
              <strong>{data.attendance.latestStatus}</strong>
              <small>{data.attendance.latestDate ? formatDate(data.attendance.latestDate) : "Kayit yok"}</small>
            </article>
            <article className="hr-self-summary__card">
              <span>Bekleyen Izin</span>
              <strong>{data.summary.pendingLeaveCount}</strong>
              <small>Onay bekleyen izin talepleri</small>
            </article>
            <article className="hr-self-summary__card">
              <span>Bekleyen Masraf</span>
              <strong>{data.summary.pendingExpenseCount}</strong>
              <small>Acik masraf talepleri</small>
            </article>
            <article className="hr-self-summary__card">
              <span>Son Bordro</span>
              <strong>{formatCurrency(data.summary.latestSalaryNetPay, data.summary.latestSalaryCurrency)}</strong>
              <small>Son maas net tutari</small>
            </article>
          </div>

          <div className="hr-self-action-grid">
            <a href="/izinler/yeni">Izin Talebi Olustur</a>
            <a href="/avans-masraf">Masraf Taleplerim</a>
            <a href="/maas">Bordro Ozetim</a>
            {data.profile ? <a href={`/personel/${encodeURIComponent(data.profile.employeeId)}`}>Profil Kartim</a> : <span>Profil Kartim</span>}
          </div>

          <div className="hr-self-layout">
            <section className="hr-self-panel">
              <div className="hr-self-panel__title">
                <div>
                  <p className="eyebrow">Izinler</p>
                  <h2>Bekleyen izin taleplerim</h2>
                </div>
              </div>
              <div className="hr-self-list">
                {data.pendingLeaves.length === 0 ? (
                  <p className="hr-self-state">Bekleyen izin talebi bulunmuyor.</p>
                ) : (
                  data.pendingLeaves.map((item) => (
                    <article className="hr-self-item" key={item.id}>
                      <div>
                        <strong>{item.leaveType}</strong>
                        <small>
                          Baslangic: {formatDate(item.fromDate)} | Bitis: {formatDate(item.toDate)}
                        </small>
                        <small>Durum: {item.status}</small>
                      </div>
                      <div className="hr-self-item__meta">
                        <CalendarClock size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-self-panel">
              <div className="hr-self-panel__title">
                <div>
                  <p className="eyebrow">Masraf</p>
                  <h2>Bekleyen masraf taleplerim</h2>
                </div>
              </div>
              <div className="hr-self-list">
                {data.pendingExpenses.length === 0 ? (
                  <p className="hr-self-state">Bekleyen masraf talebi bulunmuyor.</p>
                ) : (
                  data.pendingExpenses.map((item) => (
                    <article className="hr-self-item" key={item.id}>
                      <div>
                        <strong>{item.claimType}</strong>
                        <small>
                          Tutar: {formatCurrency(item.amount, item.currency)} | Tarih: {formatDate(item.postingDate)}
                        </small>
                        <small>Durum: {item.status}</small>
                      </div>
                      <div className="hr-self-item__meta">
                        <Wallet size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="hr-self-layout">
            <section className="hr-self-panel">
              <div className="hr-self-panel__title">
                <div>
                  <p className="eyebrow">Bordro</p>
                  <h2>Son bordro kayitlari</h2>
                </div>
              </div>
              <div className="hr-self-list">
                {data.recentSalaries.length === 0 ? (
                  <p className="hr-self-state">Bordro kaydi bulunmuyor.</p>
                ) : (
                  data.recentSalaries.map((item) => (
                    <article className="hr-self-item" key={item.id}>
                      <div>
                        <strong>{formatCurrency(item.netPay, item.currency)}</strong>
                        <small>Tarih: {formatDate(item.postingDate)}</small>
                        <small>Durum: {item.status}</small>
                      </div>
                      <div className="hr-self-item__meta">
                        <CreditCard size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-self-panel">
              <div className="hr-self-panel__title">
                <div>
                  <p className="eyebrow">Belgeler</p>
                  <h2>Gecerlilik riski olan belgeler</h2>
                </div>
              </div>
              <div className="hr-self-list">
                {data.documentRisks.length === 0 ? (
                  <p className="hr-self-state">Riskli belge kaydi bulunmuyor.</p>
                ) : (
                  data.documentRisks.map((item) => (
                    <article className="hr-self-item" key={item.id}>
                      <div>
                        <strong>{item.documentType}</strong>
                        <small>
                          Durum: {item.status} | Gecerlilik: {formatDate(item.expiryDate)}
                        </small>
                      </div>
                      <div className="hr-self-item__meta">
                        <FileWarning size={16} aria-hidden="true" />
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
