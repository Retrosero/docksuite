import { erpPost } from '../../../services/erpApi'

export type ReportType = 'cash_flow' | 'aging_analysis' | 'collection_performance' | 'profit_loss'

export type CashFlowReport = {
  from_date: string
  to_date: string
  cash_inflow: Array<{ name: string; party_name: string; paid_amount: number; posting_date: string }>
  cash_inflow_total: number
  cash_outflow: Array<{ name: string; party_name: string; paid_amount: number; posting_date: string }>
  cash_outflow_total: number
  net_flow: number
}

export type AgingBucket = {
  name: string
  customer_name: string
  outstanding_amount: number
  due_date: string
  posting_date: string
}

export type AgingReport = {
  as_of_date: string
  aging_buckets: {
    current: AgingBucket[]
    '1_30': AgingBucket[]
    '31_60': AgingBucket[]
    '61_90': AgingBucket[]
    over_90: AgingBucket[]
  }
  total_outstanding: number
  bucket_totals: Record<string, number>
}

export type CollectionReport = {
  from_date: string
  to_date: string
  total_invoiced: number
  total_collected: number
  collection_rate: number
  collections: Array<{ name: string; party_name: string; paid_amount: number; posting_date: string }>
}

export type ProfitLossReport = {
  from_date: string
  to_date: string
  total_sales: number
  total_purchases: number
  total_expenses: number
  gross_profit: number
  net_profit: number
}

const REPORT_ENDPOINTS = {
  cash_flow: '/method/shipyard_app.pre_accounting_reports.get_cash_flow_report',
  aging_analysis: '/method/shipyard_app.pre_accounting_reports.get_aging_analysis',
  collection_performance: '/method/shipyard_app.pre_accounting_reports.get_collection_performance',
  profit_loss: '/method/shipyard_app.pre_accounting_reports.get_profit_loss_summary',
  export_csv: '/method/shipyard_app.pre_accounting_reports.export_report_to_csv',
}

export async function fetchCashFlowReport(fromDate: string, toDate: string): Promise<CashFlowReport> {
  const response = await erpPost<{ message?: CashFlowReport }, { from_date: string; to_date: string }>(
    REPORT_ENDPOINTS.cash_flow,
    { from_date: fromDate, to_date: toDate }
  )
  if (!response.message) throw new Error('Nakit akışı raporu alınamadı')
  return response.message
}

export async function fetchAgingAnalysis(asOfDate?: string): Promise<AgingReport> {
  const response = await erpPost<{ message?: AgingReport }, { as_of_date?: string }>(
    REPORT_ENDPOINTS.aging_analysis,
    { as_of_date: asOfDate }
  )
  if (!response.message) throw new Error('Vade analizi raporu alınamadı')
  return response.message
}

export async function fetchCollectionPerformance(fromDate: string, toDate: string): Promise<CollectionReport> {
  const response = await erpPost<{ message?: CollectionReport }, { from_date: string; to_date: string }>(
    REPORT_ENDPOINTS.collection_performance,
    { from_date: fromDate, to_date: toDate }
  )
  if (!response.message) throw new Error('Tahsilat performans raporu alınamadı')
  return response.message
}

export async function fetchProfitLossSummary(fromDate: string, toDate: string): Promise<ProfitLossReport> {
  const response = await erpPost<{ message?: ProfitLossReport }, { from_date: string; to_date: string }>(
    REPORT_ENDPOINTS.profit_loss,
    { from_date: fromDate, to_date: toDate }
  )
  if (!response.message) throw new Error('Kar/Zarar raporu alınamadı')
  return response.message
}

export function formatReportTypeLabel(type: ReportType): string {
  const labels: Record<ReportType, string> = {
    cash_flow: 'Nakit Akışı',
    aging_analysis: 'Vade Analizi',
    collection_performance: 'Tahsilat Performansı',
    profit_loss: 'Kar/Zarar Özeti',
  }
  return labels[type] ?? type
}

export function formatAgingBucketLabel(bucket: string): string {
  const labels: Record<string, string> = {
    current: 'Vadesi Gelen',
    '1_30': '1-30 Gün',
    '31_60': '31-60 Gün',
    '61_90': '61-90 Gün',
    over_90: '90+ Gün',
  }
  return labels[bucket] ?? bucket
}

export function getReportDateRange(preset: 'today' | 'week' | 'month' | 'quarter' | 'year'): { from: string; to: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()

  switch (preset) {
    case 'today':
      return { from: formatDate(new Date(year, month, day)), to: formatDate(new Date(year, month, day)) }
    case 'week':
      return { from: formatDate(new Date(year, month, day - 7)), to: formatDate(new Date(year, month, day)) }
    case 'month':
      return { from: formatDate(new Date(year, month, 1)), to: formatDate(new Date(year, month + 1, 0)) }
    case 'quarter':
      const quarterStart = Math.floor(month / 3) * 3
      return { from: formatDate(new Date(year, quarterStart, 1)), to: formatDate(new Date(year, quarterStart + 3, 0)) }
    case 'year':
      return { from: formatDate(new Date(year, 0, 1)), to: formatDate(new Date(year, 11, 31)) }
    default:
      return { from: formatDate(new Date(year, month, 1)), to: formatDate(new Date(year, month + 1, 0)) }
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
