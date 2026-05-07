import { useEffect, useState, useCallback } from 'react'
import { fetchCashFlowForecast, type CashFlowForecast, type ForecastPeriod, type CashFlowForecastItem } from '../services/cashFlowForecastService'

const EMPTY_FORECAST: CashFlowForecast = {
  from_date: '',
  to_date: '',
  current_balance: 0,
  forecast_items: [],
  total_expected_inflow: 0,
  total_expected_outflow: 0,
  projected_end_balance: 0,
  risk_alert: false,
  risk_message: null,
}

function generateMockForecast(fromDate: string, toDate: string, p: ForecastPeriod): CashFlowForecast {
  const currentBalance = 150000
  const totalWeeks = p === '30_days' ? 4 : p === '60_days' ? 8 : 12
  const weeklyInflow = 45000
  const weeklyOutflow = 38000
  
  const forecastItems: CashFlowForecastItem[] = []
  let runningBalance = currentBalance
  
  for (let i = 0; i < totalWeeks; i++) {
    const weekLabel = `Hafta ${i + 1}`
    
    const expectedInflow = weeklyInflow + Math.random() * 15000
    const expectedOutflow = weeklyOutflow + Math.random() * 10000
    const netFlow = expectedInflow - expectedOutflow
    runningBalance += netFlow
    
    forecastItems.push({
      week: weekLabel,
      expected_inflow: Math.round(expectedInflow),
      expected_outflow: Math.round(expectedOutflow),
      net_flow: Math.round(netFlow),
      running_balance: Math.round(runningBalance),
    })
  }
  
  return {
    from_date: fromDate,
    to_date: toDate,
    current_balance: currentBalance,
    forecast_items: forecastItems,
    total_expected_inflow: Math.round(currentBalance + forecastItems.reduce((sum, item) => sum + item.expected_inflow, 0)),
    total_expected_outflow: Math.round(forecastItems.reduce((sum, item) => sum + item.expected_outflow, 0)),
    projected_end_balance: runningBalance,
    risk_alert: runningBalance < 50000,
    risk_message: runningBalance < 50000 ? 'Nakit rezervi kritik seviyede. Ödeme planlaması yapın.' : null,
  }
}

interface UseCashFlowForecastOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useCashFlowForecast(options: UseCashFlowForecastOptions = {}) {
  const { autoRefresh = false, refreshInterval = 300000 } = options
  
  const [forecast, setForecast] = useState<CashFlowForecast>(EMPTY_FORECAST)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<ForecastPeriod>('30_days')

  const loadForecast = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const today = new Date()
      const fromDate = today.toISOString().split('T')[0]
      
      let toDate: Date
      switch (period) {
        case '30_days':
          toDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
          break
        case '60_days':
          toDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
          break
        case '90_days':
          toDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
          break
        default:
          toDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      }
      
      try {
        const data = await fetchCashFlowForecast(fromDate, toDate.toISOString().split('T')[0], period)
        setForecast(data)
      } catch {
        // Backend not available, use mock data for demo
        const mockForecast = generateMockForecast(fromDate, toDate.toISOString().split('T')[0], period)
        setForecast(mockForecast)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nakit akışı tahminleme yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadForecast()
  }, [loadForecast])

  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(loadForecast, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loadForecast])

  const refresh = useCallback(() => {
    loadForecast()
  }, [loadForecast])

  const changePeriod = useCallback((newPeriod: ForecastPeriod) => {
    setPeriod(newPeriod)
  }, [])

  return {
    forecast,
    isLoading,
    error,
    period,
    refresh,
    changePeriod,
  }
}