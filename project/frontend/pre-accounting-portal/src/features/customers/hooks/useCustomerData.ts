import { useEffect, useMemo, useState } from 'react'
import { buildCustomerSummary, fetchCustomers } from '../services/customerService'
import type { CustomerItem } from '../types'

export function useCustomerData() {
  const [customers, setCustomers] = useState<CustomerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)
    fetchCustomers()
      .then((rows) => {
        if (active) setCustomers(rows)
      })
      .catch(() => {
        if (active) setError('Müşteri verileri alınamadı.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const summary = useMemo(() => buildCustomerSummary(customers), [customers])

  return { customers, summary, isLoading, error }
}
