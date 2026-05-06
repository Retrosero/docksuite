import { useEffect, useMemo, useState } from 'react'
import { fetchApprovalStates } from '../../approvals/services/approvalService'
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
      .then(async (rows) => {
        const states = await fetchApprovalStates('purchase_invoice', rows.map((row) => row.name))
        if (active) setInvoices(rows.map((row) => ({ ...row, approval_status: states[row.name] })))
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
