import { useState } from 'react'
import { PageSection } from '../../shared/ui/PageSection'
import { formatTryCurrency } from '../../shared/utils/format'
import {
  fetchCashFlowReport,
  fetchAgingAnalysis,
  fetchCollectionPerformance,
  fetchProfitLossSummary,
  formatReportTypeLabel,
  formatAgingBucketLabel,
  getReportDateRange,
  type ReportType,
} from '../../features/reports/services/reportService'

export function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType | null>(null)
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [datePreset, setDatePreset] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month')

  const loadReport = async (type: ReportType) => {
    setActiveReport(type)
    setIsLoading(true)
    setError(null)
    
    try {
      const dateRange = getReportDateRange(datePreset)
      let data: Record<string, unknown>
      
      switch (type) {
        case 'cash_flow':
          data = await fetchCashFlowReport(dateRange.from, dateRange.to)
          break
        case 'aging_analysis':
          data = await fetchAgingAnalysis()
          break
        case 'collection_performance':
          data = await fetchCollectionPerformance(dateRange.from, dateRange.to)
          break
        case 'profit_loss':
          data = await fetchProfitLossSummary(dateRange.from, dateRange.to)
          break
        default:
          throw new Error('Bilinmeyen rapor türü')
      }
      
      setReportData(data)
    } catch {
      setError('Rapor yüklenemedi.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderReportContent = () => {
    if (!reportData || !activeReport) return null
    
    switch (activeReport) {
      case 'cash_flow': {
        const data = reportData as { cash_inflow_total: number; cash_outflow_total: number; net_flow: number }
        return (
          <div className="report-summary">
            <div className="summary-card positive">
              <span>Giriş</span>
              <strong>{formatTryCurrency(data.cash_inflow_total)}</strong>
            </div>
            <div className="summary-card negative">
              <span>Çıkış</span>
              <strong>{formatTryCurrency(data.cash_outflow_total)}</strong>
            </div>
            <div className={`summary-card ${data.net_flow >= 0 ? 'positive' : 'negative'}`}>
              <span>Net</span>
              <strong>{formatTryCurrency(data.net_flow)}</strong>
            </div>
          </div>
        )
      }
      case 'aging_analysis': {
        const data = reportData as { bucket_totals: Record<string, number>; total_outstanding: number }
        return (
          <div className="report-summary">
            {Object.entries(data.bucket_totals).map(([bucket, total]) => (
              <div key={bucket} className="summary-card">
                <span>{formatAgingBucketLabel(bucket)}</span>
                <strong>{formatTryCurrency(total)}</strong>
              </div>
            ))}
            <div className="summary-card total">
              <span>Toplam</span>
              <strong>{formatTryCurrency(data.total_outstanding)}</strong>
            </div>
          </div>
        )
      }
      case 'collection_performance': {
        const data = reportData as { total_invoiced: number; total_collected: number; collection_rate: number }
        return (
          <div className="report-summary">
            <div className="summary-card">
              <span>Faturalanan</span>
              <strong>{formatTryCurrency(data.total_invoiced)}</strong>
            </div>
            <div className="summary-card positive">
              <span>Tahsil Edilen</span>
              <strong>{formatTryCurrency(data.total_collected)}</strong>
            </div>
            <div className="summary-card">
              <span>Tahsilat Oranı</span>
              <strong>%{data.collection_rate.toFixed(1)}</strong>
            </div>
          </div>
        )
      }
      case 'profit_loss': {
        const data = reportData as { total_sales: number; total_purchases: number; total_expenses: number; gross_profit: number; net_profit: number }
        return (
          <div className="report-summary">
            <div className="summary-card positive">
              <span>Satış</span>
              <strong>{formatTryCurrency(data.total_sales)}</strong>
            </div>
            <div className="summary-card negative">
              <span>Alış</span>
              <strong>{formatTryCurrency(data.total_purchases)}</strong>
            </div>
            <div className="summary-card negative">
              <span>Gider</span>
              <strong>{formatTryCurrency(data.total_expenses)}</strong>
            </div>
            <div className="summary-card">
              <span>Brüt Kar</span>
              <strong>{formatTryCurrency(data.gross_profit)}</strong>
            </div>
            <div className={`summary-card ${data.net_profit >= 0 ? 'positive' : 'negative'}`}>
              <span>Net Kar</span>
              <strong>{formatTryCurrency(data.net_profit)}</strong>
            </div>
          </div>
        )
      }
      default:
        return null
    }
  }

  const reports: { type: ReportType; description: string }[] = [
    { type: 'cash_flow', description: 'Nakit giriş/çıkış özeti' },
    { type: 'aging_analysis', description: 'Cari vade yaşlandırma' },
    { type: 'collection_performance', description: 'Tahsilat oranı ve performans' },
    { type: 'profit_loss', description: 'Dönemsel kar/zarar' },
  ]

  return (
    <PageSection title="Raporlar" subtitle="Mali analiz ve raporlama">
      <div className="toolbar-stack">
        {(['today', 'week', 'month', 'quarter', 'year'] as const).map((preset) => (
          <button
            key={preset}
            type="button"
            className={datePreset === preset ? '' : 'ghost'}
            onClick={() => setDatePreset(preset)}
          >
            {preset === 'today' ? 'Bugün' : preset === 'week' ? 'Hafta' : preset === 'month' ? 'Ay' : preset === 'quarter' ? 'Çeyrek' : 'Yıl'}
          </button>
        ))}
      </div>

      <div className="report-tabs">
        {reports.map(({ type, description }) => (
          <button
            key={type}
            type="button"
            className={activeReport === type ? '' : 'ghost'}
            onClick={() => void loadReport(type)}
          >
            <strong>{formatReportTypeLabel(type)}</strong>
            <span>{description}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="muted">Rapor yükleniyor...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : reportData ? (
        renderReportContent()
      ) : (
        <p className="muted">Rapor seçin.</p>
      )}
    </PageSection>
  )
}
