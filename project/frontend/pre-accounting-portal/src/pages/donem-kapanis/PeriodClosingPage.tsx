import { useState } from 'react'
import { PageSection } from '../../shared/ui/PageSection'
import {
  runPeriodClosingChecks,
  formatCheckStatus,
  type PeriodClosingReport,
} from '../../features/einvoice/services/eInvoiceService'

export function PeriodClosingPage() {
  const [report, setReport] = useState<PeriodClosingReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-01-01`
  })
  const [toDate, setToDate] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })

  const runChecks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await runPeriodClosingChecks(fromDate, toDate)
      setReport(result)
    } catch {
      setError('Dönem kapanış kontrolleri çalıştırılamadı.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageSection title="Dönem Kapanış Kontrolleri" subtitle="Muhasebe dönem kapanışı için gerekli kontroller">
      <div className="form-grid">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <button type="button" onClick={() => void runChecks()}>
          Kontrolleri Çalıştır
        </button>
      </div>

      {isLoading ? (
        <p className="muted">Kontroller çalıştırılıyor...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : report ? (
        <div className="closing-summary">
          <div className={`closing-status ${report.is_ready_for_closing ? 'success' : 'warning'}`}>
            <strong>{report.is_ready_for_closing ? '✓ Dönem Kapanışa Hazır' : '⚠ Dönem Kapanışı İçin Kontrol Gerekli'}</strong>
            <span>{report.passed_checks}/{report.total_checks} kontrol geçti</span>
          </div>

          <div className="check-list">
            {report.checks.map((check, idx) => (
              <article key={idx} className={`check-card ${check.status}`}>
                <div className="check-header">
                  <strong>{check.check_name}</strong>
                  <span className={`status-badge ${check.status}`}>{formatCheckStatus(check.status)}</span>
                </div>
                <p className="check-details">{check.details}</p>
                {check.items.length > 0 && (
                  <details>
                    <summary>{check.items.length} kalem</summary>
                    <ul>
                      {check.items.slice(0, 5).map((item, i) => (
                        <li key={i}>{item.name}</li>
                      ))}
                      {check.items.length > 5 && <li>...ve {check.items.length - 5} daha</li>}
                    </ul>
                  </details>
                )}
              </article>
            ))}
          </div>

          {!report.is_ready_for_closing && (
            <div className="closing-warning">
              <p>Devam etmeden önce tüm başarısız kontrolleri çözmeniz önerilir.</p>
            </div>
          )}
        </div>
      ) : (
        <p className="muted">Tarih aralığı seçin ve kontrolleri çalıştırın.</p>
      )}
    </PageSection>
  )
}
