import type { RoutePageProps } from '../../app/pageProps'
import { useReportSummary } from '../../features/reports/hooks/useReportSummary'
import { formatTryCurrency } from '../../shared/utils/format'
import { PageSection } from '../../shared/ui/PageSection'

export function ReportsPage(props: RoutePageProps) {
  void props
  const { summary, isLoading, error } = useReportSummary()
  return (
    <PageSection title="Raporlar" subtitle="Satis, tahsilat ve cari ozet raporlari">
      {isLoading ? <p className="muted">Rapor verileri yukleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Aylik Satis Ozeti</h3>
          <strong>{formatTryCurrency(summary.totalSales)}</strong>
        </article>
        <article className="metric-card">
          <h3>Tahsilat Listesi</h3>
          <strong>{formatTryCurrency(summary.totalCollections)}</strong>
        </article>
        <article className="metric-card">
          <h3>Net Bakiye</h3>
          <strong>{formatTryCurrency(summary.netBalance)}</strong>
        </article>
      </div>
    </PageSection>
  )
}
