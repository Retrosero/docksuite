import type { RoutePageProps } from '../../app/pageProps'
import { useReportSummary } from '../../features/reports/hooks/useReportSummary'
import { buildReportCsv, buildReportExportRows } from '../../features/reports/services/reportsService'
import { formatTryCurrency } from '../../shared/utils/format'
import { PageSection } from '../../shared/ui/PageSection'

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function ReportsPage({ settings }: RoutePageProps) {
  const { summary, isLoading, error } = useReportSummary()
  const onExport = () => {
    const csv = buildReportCsv(buildReportExportRows(summary))
    downloadTextFile('on-muhasebe-rapor-ozeti.csv', csv)
  }

  return (
    <PageSection title="Raporlar" subtitle="Satış, tahsilat ve cari özet raporları">
      {settings['reports.enable_csv_export'] ? (
        <div className="toolbar">
          <button type="button" onClick={onExport} disabled={isLoading}>
            CSV İndir
          </button>
        </div>
      ) : null}
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
