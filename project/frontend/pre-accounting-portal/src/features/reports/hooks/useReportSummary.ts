import { useEffect, useState } from 'react'
import { fetchReportSummary } from '../services/reportsService'

type ReportSummary = {
  totalSales: number
  totalPurchases: number
  totalCollections: number
  totalPayments: number
  netBalance: number
}

const EMPTY: ReportSummary = { totalSales: 0, totalPurchases: 0, totalCollections: 0, totalPayments: 0, netBalance: 0 }

export function useReportSummary() {
  const [summary, setSummary] = useState<ReportSummary>(EMPTY)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchReportSummary()
      .then((data) => {
        if (active) setSummary(data)
      })
      .catch(() => {
        if (active) setError('Rapor verileri alınamadı.')
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
