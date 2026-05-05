import { getResourceList } from '../../../services/erpApi'
import type { DashboardSummary } from '../types'

type SalesInvoiceRow = {
  posting_date?: string
  due_date?: string
  grand_total?: number
  base_grand_total?: number
  outstanding_amount?: number
}

type PurchaseInvoiceRow = {
  outstanding_amount?: number
}

type PaymentEntryRow = {
  posting_date?: string
  paid_amount?: number
  docstatus?: number
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0)
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const today = isoDate(new Date())
  const monthStart = today.slice(0, 7) + '-01'

  const [todaySalesRows, openSalesRows, overdueRows, openPurchaseRows, todayCollectionRows, monthCollectionRows, draftInvoiceRows] =
    await Promise.all([
      getResourceList<SalesInvoiceRow>('Sales Invoice', {
        fields: ['posting_date', 'grand_total', 'base_grand_total'],
        filters: [
          ['docstatus', '=', 1],
          ['posting_date', '=', today],
        ],
        limit: 200,
      }),
      getResourceList<SalesInvoiceRow>('Sales Invoice', {
        fields: ['outstanding_amount'],
        filters: [
          ['docstatus', '=', 1],
          ['outstanding_amount', '>', 0],
        ],
        limit: 500,
      }),
      getResourceList<SalesInvoiceRow>('Sales Invoice', {
        fields: ['due_date', 'outstanding_amount'],
        filters: [
          ['docstatus', '=', 1],
          ['outstanding_amount', '>', 0],
          ['due_date', '<', today],
        ],
        limit: 500,
      }),
      getResourceList<PurchaseInvoiceRow>('Purchase Invoice', {
        fields: ['outstanding_amount'],
        filters: [
          ['docstatus', '=', 1],
          ['outstanding_amount', '>', 0],
        ],
        limit: 500,
      }),
      getResourceList<PaymentEntryRow>('Payment Entry', {
        fields: ['posting_date', 'paid_amount'],
        filters: [
          ['docstatus', '=', 1],
          ['posting_date', '=', today],
          ['payment_type', '=', 'Receive'],
        ],
        limit: 200,
      }),
      getResourceList<PaymentEntryRow>('Payment Entry', {
        fields: ['posting_date', 'paid_amount'],
        filters: [
          ['docstatus', '=', 1],
          ['posting_date', '>=', monthStart],
          ['posting_date', '<=', today],
          ['payment_type', '=', 'Receive'],
        ],
        limit: 500,
      }),
      getResourceList<SalesInvoiceRow>('Sales Invoice', {
        fields: ['name'],
        filters: [['docstatus', '=', 0]],
        limit: 100,
      }),
    ])

  const todaySalesTotal = sum(todaySalesRows.map((row) => row.base_grand_total ?? row.grand_total ?? 0))
  const pendingCollectionsTotal = sum(openSalesRows.map((row) => row.outstanding_amount ?? 0))
  const pendingPaymentsTotal = sum(openPurchaseRows.map((row) => row.outstanding_amount ?? 0))
  const overdueReceivablesTotal = sum(overdueRows.map((row) => row.outstanding_amount ?? 0))
  const todayCollectionTotal = sum(todayCollectionRows.map((row) => row.paid_amount ?? 0))
  const monthCollectionTotal = sum(monthCollectionRows.map((row) => row.paid_amount ?? 0))
  const openInvoiceCount = openSalesRows.length
  const draftInvoiceCount = draftInvoiceRows.length

  return {
    todaySalesTotal,
    pendingCollectionsTotal,
    pendingPaymentsTotal,
    overdueReceivablesTotal,
    todayCollectionTotal,
    monthCollectionTotal,
    openInvoiceCount,
    draftInvoiceCount,
  }
}
