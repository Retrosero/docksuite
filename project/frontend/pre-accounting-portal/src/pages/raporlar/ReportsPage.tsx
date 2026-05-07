import { useMemo, useState } from 'react'
import type { RoutePageProps } from '../../app/pageProps'
import { useFeatureSettings } from '../../shared/hooks/useFeatureSettings'
import { PageSection } from '../../shared/ui/PageSection'
import { formatTryCurrency } from '../../shared/utils/format'
import { useReportSummary } from '../../features/reports/hooks/useReportSummary'
import { buildReportCsv, buildReportExportRows } from '../../features/reports/services/reportsService'
import {
  fetchAgingAnalysis,
  fetchCashFlowReport,
  fetchCollectionPerformance,
  fetchProfitLossSummary,
  formatAgingBucketLabel,
  formatReportTypeLabel,
  getReportDateRange,
  type ReportType,
} from '../../features/reports/services/reportService'
import { CashFlowForecastScreen } from '../../features/reports/components/CashFlowForecastScreen'

type DatePreset = 'today' | 'week' | 'month' | 'quarter' | 'year'
const BASE_REPORTS: { type: ReportType; description: string }[] = [
  { type: 'cash_flow', description: 'Nakit giris/cikis ozeti' },
  { type: 'aging_analysis', description: 'Cari vade yaslandirma' },
  { type: 'collection_performance', description: 'Tahsilat orani ve performans' },
  { type: 'profit_loss', description: 'Donemsel kar/zarar' },
]

export function ReportsPage({ userRoleTemplate }: RoutePageProps) {
  const { settings } = useFeatureSettings()
  const { summary, isLoading: isSummaryLoading, error: summaryError } = useReportSummary()
  const [activeReport, setActiveReport] = useState<ReportType | null>(null)
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [datePreset, setDatePreset] = useState<DatePreset>('month')

  const reportScopes: Record<ReportType, Array<RoutePageProps['userRoleTemplate']>> = {
    cash_flow: ['yonetici', 'muhasebe_sorumlusu', 'satis_operasyon', 'salt_okuma'],
    aging_analysis: ['yonetici', 'muhasebe_sorumlusu', 'satis_operasyon', 'salt_okuma'],
    collection_performance: ['yonetici', 'muhasebe_sorumlusu', 'satis_operasyon'],
    profit_loss: ['yonetici', 'muhasebe_sorumlusu'],
  }

  const reports: { type: ReportType; description: string }[] = useMemo(
    () => BASE_REPORTS.filter((item) => {
      const allowed = reportScopes[item.type]
      return !userRoleTemplate || allowed.includes(userRoleTemplate)
    }),
    [userRoleTemplate],
  )

  const handleCsvDownload = () => {
    const rows = buildReportExportRows(summary)
    const csvContent = buildReportCsv(rows)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'rapor-ozeti.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePdfExport = () => {
    const content = [
      'Rapor Ozeti',
      `Aylik Satis Ozeti: ${summary.totalSales.toFixed(2)}`,
      `Alis Ozeti: ${summary.totalPurchases.toFixed(2)}`,
      `Tahsilat Ozeti: ${summary.totalCollections.toFixed(2)}`,
      `Odeme Ozeti: ${summary.totalPayments.toFixed(2)}`,
      `Net Bakiye: ${summary.netBalance.toFixed(2)}`,
    ].join('\n')
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
    if (!popup) return
    popup.document.write(`<pre style="font-family: ui-monospace, monospace; padding: 24px;">${content}</pre>`)
    popup.document.close()
    popup.focus()
    popup.print()
  }

  const loadReport = async (type: ReportType) => {
    setActiveReport(type)
    setIsLoading(true)
    setError(null)
    try {
      const dateRange = getReportDateRange(datePreset)
      let data: Record<string, unknown>
      if (type === 'cash_flow') data = await fetchCashFlowReport(dateRange.from, dateRange.to)
      else if (type === 'aging_analysis') data = await fetchAgingAnalysis()
      else if (type === 'collection_performance') data = await fetchCollectionPerformance(dateRange.from, dateRange.to)
      else data = await fetchProfitLossSummary(dateRange.from, dateRange.to)
      setReportData(data)
    } catch {
      setError('Rapor yuklenemedi.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderReportContent = () => {
    if (!reportData || !activeReport) return null
    if (activeReport === 'cash_flow') {
      const data = reportData as { cash_inflow_total: number; cash_outflow_total: number; net_flow: number }
      return (
        <div className="report-summary">
          <div className="summary-card positive"><span>Giris</span><strong>{formatTryCurrency(data.cash_inflow_total)}</strong></div>
          <div className="summary-card negative"><span>Cikis</span><strong>{formatTryCurrency(data.cash_outflow_total)}</strong></div>
          <div className={`summary-card ${data.net_flow >= 0 ? 'positive' : 'negative'}`}><span>Net</span><strong>{formatTryCurrency(data.net_flow)}</strong></div>
        </div>
      )
    }
    if (activeReport === 'aging_analysis') {
      const data = reportData as { bucket_totals: Record<string, number>; total_outstanding: number }
      return (
        <div className="report-summary">
          {Object.entries(data.bucket_totals).map(([bucket, total]) => (
            <div key={bucket} className="summary-card"><span>{formatAgingBucketLabel(bucket)}</span><strong>{formatTryCurrency(total)}</strong></div>
          ))}
          <div className="summary-card total"><span>Toplam</span><strong>{formatTryCurrency(data.total_outstanding)}</strong></div>
        </div>
      )
    }
    if (activeReport === 'collection_performance') {
      const data = reportData as { total_invoiced: number; total_collected: number; collection_rate: number }
      return (
        <div className="report-summary">
          <div className="summary-card"><span>Faturalanan</span><strong>{formatTryCurrency(data.total_invoiced)}</strong></div>
          <div className="summary-card positive"><span>Tahsil Edilen</span><strong>{formatTryCurrency(data.total_collected)}</strong></div>
          <div className="summary-card"><span>Tahsilat Orani</span><strong>%{data.collection_rate.toFixed(1)}</strong></div>
        </div>
      )
    }
    const data = reportData as { total_sales: number; total_purchases: number; total_expenses: number; gross_profit: number; net_profit: number }
    return (
      <div className="report-summary">
        <div className="summary-card positive"><span>Satis</span><strong>{formatTryCurrency(data.total_sales)}</strong></div>
        <div className="summary-card negative"><span>Alis</span><strong>{formatTryCurrency(data.total_purchases)}</strong></div>
        <div className="summary-card negative"><span>Gider</span><strong>{formatTryCurrency(data.total_expenses)}</strong></div>
        <div className="summary-card"><span>Brut Kar</span><strong>{formatTryCurrency(data.gross_profit)}</strong></div>
        <div className={`summary-card ${data.net_profit >= 0 ? 'positive' : 'negative'}`}><span>Net Kar</span><strong>{formatTryCurrency(data.net_profit)}</strong></div>
      </div>
    )
  }

  return (
    <PageSection title="Raporlar" subtitle="Mali analiz ve raporlama">
      <div className="report-summary">
        <div className="summary-card"><span>Aylik Satis Ozeti</span><strong>{isSummaryLoading ? 'Yukleniyor...' : formatTryCurrency(summary.totalSales)}</strong></div>
        <div className="summary-card"><span>Alis Ozeti</span><strong>{isSummaryLoading ? 'Yukleniyor...' : formatTryCurrency(summary.totalPurchases)}</strong></div>
        <div className="summary-card"><span>Tahsilat Ozeti</span><strong>{isSummaryLoading ? 'Yukleniyor...' : formatTryCurrency(summary.totalCollections)}</strong></div>
        <div className="summary-card"><span>Odeme Ozeti</span><strong>{isSummaryLoading ? 'Yukleniyor...' : formatTryCurrency(summary.totalPayments)}</strong></div>
      </div>

      {summaryError ? <p className="error-text">{summaryError}</p> : null}

      {settings['reports.enable_csv_export'] ? (
        <div className="toolbar">
          <button type="button" onClick={handleCsvDownload}>CSV Indir</button>
          <button type="button" className="ghost" onClick={handlePdfExport}>PDF Yazdir</button>
        </div>
      ) : null}

      <div className="toolbar-stack">
        {(['today', 'week', 'month', 'quarter', 'year'] as const).map((preset) => (
          <button key={preset} type="button" className={datePreset === preset ? '' : 'ghost'} onClick={() => setDatePreset(preset)}>
            {preset === 'today' ? 'Bugun' : preset === 'week' ? 'Hafta' : preset === 'month' ? 'Ay' : preset === 'quarter' ? 'Ceyrek' : 'Yil'}
          </button>
        ))}
      </div>

      <div className="report-tabs">
        {reports.map(({ type, description }) => (
          <button key={type} type="button" className={activeReport === type ? '' : 'ghost'} onClick={() => void loadReport(type)}>
            <strong>{formatReportTypeLabel(type)}</strong>
            <span>{description}</span>
          </button>
        ))}
      </div>

      {isLoading ? <p className="muted">Rapor yukleniyor...</p> : error ? <p className="error-text">{error}</p> : reportData ? renderReportContent() : <p className="muted">Rapor secin.</p>}
    </PageSection>
  )
}

export function CashFlowForecastPage() {
  return <CashFlowForecastScreen />
}
