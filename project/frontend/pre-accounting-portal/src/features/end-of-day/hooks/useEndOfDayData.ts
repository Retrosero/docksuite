import { useEffect, useState } from 'react'
import { fetchEndOfDaySummary } from '../services/endOfDayService'
import type { EndOfDayActivity, EndOfDaySummary } from '../types'

const EMPTY_SUMMARY: EndOfDaySummary = {
  salesTotal: 0,
  collectionTotal: 0,
  purchaseTotal: 0,
  expenseTotal: 0,
  netCashMovement: 0,
  openReceivableTotal: 0,
  openPayableTotal: 0,
}

export function useEndOfDayData() {
  const [summary, setSummary] = useState<EndOfDaySummary>(EMPTY_SUMMARY)
  const [activities, setActivities] = useState<EndOfDayActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)
    fetchEndOfDaySummary()
      .then((result) => {
        if (!active) return
        setSummary(result.summary)
        setActivities(result.activities)
      })
      .catch(() => {
        if (active) setError('Gün sonu verileri alınamadı.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { summary, activities, isLoading, error }
}
