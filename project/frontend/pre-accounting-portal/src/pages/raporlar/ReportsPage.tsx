import type { RoutePageProps } from '../../app/pageProps'
import { useReportSummary } from '../../features/reports/hooks/useReportSummary'
import { formatTryCurrency } from '../../shared/utils/format'
import { PageSection } from '../../shared/ui/PageSection'

export function ReportsPage(props: RoutePageProps) {
  void props
  const { summary, isLoading, error } = useReportSummary()
  return (
    <PageSection title="Raporlar" subtitle="Satış, tahsilat ve cari özet raporları">
      {isLoading ? <p className="muted">Rapor verileri yükleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Aylık Satış Özeti</h3>
          <strong>{formatTryCurrency(summary.totalSales)}</strong>
        </article>
        <article className="metric-card">
          <h3>Alış Özeti</h3>
          <strong>{formatTryCurrency(summary.totalPurchases)}</strong>
        </article>
        <article className="metric-card">
          <h3>Tahsilat Özeti</h3>
          <strong>{formatTryCurrency(summary.totalCollections)}</strong>
        </article>
        <article className="metric-card">
          <h3>Ödeme Özeti</h3>
          <strong>{formatTryCurrency(summary.totalPayments)}</strong>
        </article>
        <article className="metric-card">
          <h3>Net Bakiye</h3>
          <strong>{formatTryCurrency(summary.netBalance)}</strong>
        </article>
      </div>
    </PageSection>
  )
}
