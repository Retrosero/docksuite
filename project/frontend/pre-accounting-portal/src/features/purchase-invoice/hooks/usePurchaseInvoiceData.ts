import { useEffect, useMemo, useState } from 'react'
import { buildPurchaseInvoiceSummary, fetchPurchaseInvoices } from '../services/purchaseInvoiceService'
import type { PurchaseInvoiceItem } from '../types'

export function usePurchaseInvoiceData() {
  const [invoices, setInvoices] = useState<PurchaseInvoiceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)
    fetchPurchaseInvoices()
      .then((rows) => {
        if (active) setInvoices(rows)
      })
      .catch(() => {
        if (active) setError('Alış faturası verileri alınamadı.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const summary = useMemo(() => buildPurchaseInvoiceSummary(invoices), [invoices])

  return { invoices, summary, isLoading, error }
}
