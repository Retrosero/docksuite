import { erpPost } from '../../../services/erpApi'

export type AgingPeriod = 'current' | '1_30' | '31_60' | '61_90' | 'over_90'

export type DetailedAgingItem = {
  party_name: string
  party_type: 'Customer' | 'Supplier'
  total_outstanding: number
  buckets: {
    current: number
    '1_30': number
    '31_60': number
    '61_90': number
    over_90: number
  }
  oldest_invoice_date: string | null
  risk_score: 'low' | 'medium' | 'high'
}

export type DetailedAgingReport = {
  as_of_date: string
  customers: DetailedAgingItem[]
  suppliers: DetailedAgingItem[]
  total_customer_outstanding: number
  total_supplier_outstanding: number
  total_outstanding: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
}

export type AgingSummary = {
  label: string
  amount: number
  percentage: number
  color: string
}

export async function fetchDetailedAgingReport(asOfDate?: string): Promise<DetailedAgingReport> {
  const response = await erpPost<{ message?: DetailedAgingReport }, { as_of_date?: string }>(
    '/method/shipyard_app.pre_accounting_reports.get_detailed_aging_report',
    { as_of_date: asOfDate }
  )
  if (!response.message) {
    throw new Error('Detaylı vade analizi raporu alınamadı')
  }
  return response.message
}

export async function fetchCustomerAgingSummary(customerId?: string): Promise<AgingSummary[]> {
  const response = await erpPost<{ message?: AgingSummary[] }, { customer_id?: string }>(
    '/method/shipyard_app.pre_accounting_reports.get_customer_aging_summary',
    { customer_id: customerId }
  )
  if (!response.message) {
    throw new Error('Müşteri vade özeti alınamadı')
  }
  return response.message
}

export function calculateRiskScore(item: DetailedAgingItem): 'low' | 'medium' | 'high' {
  const over90Percentage = item.buckets.over_90 / (item.total_outstanding || 1)
  
  // High risk: > 30% over 90 days or > 60 days oldest invoice
  if (over90Percentage > 0.3) return 'high'
  if (item.oldest_invoice_date) {
    const daysSinceOldest = Math.floor(
      (Date.now() - new Date(item.oldest_invoice_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceOldest > 60) return 'high'
  }
  
  // Medium risk: > 15% over 90 days or > 30 days oldest invoice
  if (over90Percentage > 0.15) return 'medium'
  if (item.oldest_invoice_date) {
    const daysSinceOldest = Math.floor(
      (Date.now() - new Date(item.oldest_invoice_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceOldest > 30) return 'medium'
  }
  
  return 'low'
}

export function getRiskColor(score: 'low' | 'medium' | 'high'): string {
  const colors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
  return colors[score]
}

export function formatAgingPeriodLabel(period: AgingPeriod): string {
  const labels: Record<AgingPeriod, string> = {
    current: 'Vadesi Gelen',
    '1_30': '1-30 Gün',
    '31_60': '31-60 Gün',
    '61_90': '61-90 Gün',
    over_90: '90+ Gün',
  }
  return labels[period] ?? period
}

export function calculateExpectedCollection(dateRange: '30' | '60' | '90'): number {
  // This would typically call an API
  // For now, returns estimated value based on aging data
  const periodMultiplier: Record<'30' | '60' | '90', number> = {
    '30': 1,
    '60': 1.8,
    '90': 2.4,
  }
  return periodMultiplier[dateRange] * 0
}

export function getAgingColor(period: AgingPeriod): string {
  const colors: Record<AgingPeriod, string> = {
    current: '#22c55e',
    '1_30': '#84cc16',
    '31_60': '#f59e0b',
    '61_90': '#f97316',
    over_90: '#ef4444',
  }
  return colors[period]
}
