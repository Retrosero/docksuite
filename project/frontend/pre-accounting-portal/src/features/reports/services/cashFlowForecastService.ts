import { erpPost } from '../../../services/erpApi'

export type ForecastPeriod = '30_days' | '60_days' | '90_days'

export type CashFlowForecastItem = {
  week: string
  expected_inflow: number
  expected_outflow: number
  net_flow: number
  running_balance: number
}

export type CashFlowForecast = {
  from_date: string
  to_date: string
  current_balance: number
  forecast_items: CashFlowForecastItem[]
  total_expected_inflow: number
  total_expected_outflow: number
  projected_end_balance: number
  risk_alert: boolean
  risk_message: string | null
}

export type ForecastAssumption = {
  payment_days_customer: number
  payment_days_supplier: number
  recurring_expenses: number
  seasonal_adjustment: number
}

export async function fetchCashFlowForecast(
  fromDate: string,
  toDate: string,
  period: ForecastPeriod = '30_days'
): Promise<CashFlowForecast> {
  const response = await erpPost<{ message?: CashFlowForecast }, { from_date: string; to_date: string; period: string }>(
    '/method/shipyard_app.pre_accounting_reports.get_cash_flow_forecast',
    { from_date: fromDate, to_date: toDate, period }
  )
  if (!response.message) {
    throw new Error('Nakit akışı tahminleme verisi alınamadı')
  }
  return response.message
}

export async function fetchForecastAssumptions(): Promise<ForecastAssumption> {
  const response = await erpPost<{ message?: ForecastAssumption }, Record<string, never>>(
    '/method/shipyard_app.pre_accounting_reports.get_forecast_assumptions',
    {}
  )
  if (!response.message) {
    throw new Error('Tahmin varsayımları alınamadı')
  }
  return response.message
}

export async function saveForecastAssumptions(assumptions: Partial<ForecastAssumption>): Promise<ForecastAssumption> {
  const response = await erpPost<{ message?: ForecastAssumption }, Partial<ForecastAssumption>>(
    '/method/shipyard_app.pre_accounting_reports.save_forecast_assumptions',
    assumptions
  )
  if (!response.message) {
    throw new Error('Tahmin varsayımları kaydedilemedi')
  }
  return response.message
}

export function formatForecastPeriodLabel(period: ForecastPeriod): string {
  const labels: Record<ForecastPeriod, string> = {
    '30_days': '30 Gün',
    '60_days': '60 Gün',
    '90_days': '90 Gün',
  }
  return labels[period] ?? period
}

export function calculateRiskLevel(forecast: CashFlowForecast): 'low' | 'medium' | 'high' {
  if (forecast.projected_end_balance < 0) return 'high'
  if (forecast.risk_alert) return 'high'
  const coverageRatio = forecast.current_balance / (forecast.total_expected_outflow || 1)
  if (coverageRatio < 0.5) return 'high'
  if (coverageRatio < 1) return 'medium'
  return 'low'
}

export function getRiskColor(level: 'low' | 'medium' | 'high'): string {
  const colors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
  return colors[level]
}