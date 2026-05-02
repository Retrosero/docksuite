import { useEffect, useState } from 'react'
import { fetchDashboardSummary } from '../services/dashboardService'
import type { DashboardSummary } from '../types'

const EMPTY_SUMMARY: DashboardSummary = {
  todaySalesTotal: 0,
  pendingCollectionsTotal: 0,
  pendingPaymentsTotal: 0,
  overdueReceivablesTotal: 0,
}

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    fetchDashboardSummary()
      .then((next) => {
        if (active) setSummary(next)
      })
      .catch(() => {
        if (active) setError('Dashboard verisi alinamadi.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { summary, isLoading, error }
}
