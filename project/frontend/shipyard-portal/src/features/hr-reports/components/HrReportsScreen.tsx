import { AlertTriangle, BarChart3, Clock3, FileWarning, RefreshCw, Users } from "lucide-react";
import { useHrReportsData } from "../hooks/useHrReportsData";

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

function formatMoney(value: number) {
  return `${value.toFixed(2)} TRY`;
}

export function HrReportsScreen() {
  const { data, loading, error, refresh } = useHrReportsData();

  return (
    <section className="hr-reports-screen">
      <header className="hr-reports-hero">
        <div className="hr-reports-hero__copy">
          <p className="eyebrow">IK Raporlari</p>
          <h1>IK Raporlari</h1>
          <p>Headcount, devamsizlik, izin, mesai, bordro ve belge uyum risklerini tek panelde izleyin.</p>
        </div>
        <button className="hr-reports-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-reports-state hr-reports-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-reports-state">
          <Clock3 size={18} aria-hidden="true" />
          <p>IK raporlari verisi yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          <div className="hr-reports-summary">
            <article className="hr-reports-summary__card">
              <span>Toplam Personel</span>
              <strong>{data.summary.totalEmployeeCount}</strong>
              <small>Aktif: {data.summary.activeEmployeeCount}</small>
            </article>
            <article className="hr-reports-summary__card">
              <span>Bekleyen Izin</span>
              <strong>{data.summary.pendingLeaveCount}</strong>
              <small>Leave Application</small>
            </article>
            <article className="hr-reports-summary__card">
              <span>Bekleyen Mesai</span>
              <strong>{data.summary.pendingOvertimeCount}</strong>
              <small>Overtime Request</small>
            </article>
            <article className="hr-reports-summary__card">
              <span>Bordro Kaydi</span>
              <strong>{data.summary.salarySlipCount}</strong>
              <small>Net Toplam: {formatMoney(data.summary.salaryNetPayTotal)}</small>
            </article>
            <article className="hr-reports-summary__card">
              <span>Devamsizlik Riski</span>
              <strong>{data.summary.attendanceRiskCount}</strong>
              <small>Son 30 gun absent/half day</small>
            </article>
            <article className="hr-reports-summary__card">
              <span>Belge Riski</span>
              <strong>{data.summary.documentRiskCount}</strong>
              <small>Dolmus/yaklasan belge</small>
            </article>
          </div>

          <div className="hr-reports-layout">
            <section className="hr-reports-panel">
              <div className="hr-reports-panel__title">
                <div>
                  <p className="eyebrow">Devamsizlik</p>
                  <h2>Attendance risk listesi</h2>
                </div>
              </div>
              <div className="hr-reports-list">
                {data.attendanceRisks.length === 0 ? (
                  <p className="hr-reports-state">Devamsizlik riski kaydi bulunmuyor.</p>
                ) : (
                  data.attendanceRisks.map((item) => (
                    <article className="hr-reports-item" key={item.id}>
                      <div>
                        <strong>{item.employeeName}</strong>
                        <small>
                          Sicil: {item.employeeId} | Durum: {item.status}
                        </small>
                        <small>Tarih: {formatDate(item.attendanceDate)}</small>
                      </div>
                      <div className="hr-reports-item__meta">
                        <Users size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-reports-panel">
              <div className="hr-reports-panel__title">
                <div>
                  <p className="eyebrow">Izin Onay</p>
                  <h2>Bekleyen izin talepleri</h2>
                </div>
              </div>
              <div className="hr-reports-list">
                {data.pendingLeaves.length === 0 ? (
                  <p className="hr-reports-state">Bekleyen izin talebi bulunmuyor.</p>
                ) : (
                  data.pendingLeaves.map((item) => (
                    <article className="hr-reports-item" key={item.id}>
                      <div>
                        <strong>{item.employeeName}</strong>
                        <small>
                          Sicil: {item.employeeId} | Izin: {item.leaveType}
                        </small>
                        <small>
                          Baslangic: {formatDate(item.fromDate)} | Bitis: {formatDate(item.toDate)} | Durum: {item.status}
                        </small>
                      </div>
                      <div className="hr-reports-item__meta">
                        <BarChart3 size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="hr-reports-panel">
            <div className="hr-reports-panel__title">
              <div>
                <p className="eyebrow">Belge Uyum Riski</p>
                <h2>Suresi dolan veya yaklasan belgeler</h2>
              </div>
            </div>
            <div className="hr-reports-list">
              {data.documentRisks.length === 0 ? (
                <p className="hr-reports-state">Belge uyum riski kaydi bulunmuyor.</p>
              ) : (
                data.documentRisks.map((item) => (
                  <article className="hr-reports-item" key={item.id}>
                    <div>
                      <strong>{item.employeeName}</strong>
                      <small>
                        Sicil: {item.employeeId} | Belge: {item.documentType}
                      </small>
                      <small>
                        Durum: {item.status} | Gecerlilik: {formatDate(item.expiryDate)}
                      </small>
                    </div>
                    <div className="hr-reports-item__meta">
                      <FileWarning size={16} aria-hidden="true" />
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
