import { getResourceList } from '../../../services/erpApi'
import type { EndOfDayActivity, EndOfDaySummary } from '../types'

type SalesInvoiceRow = {
  grand_total?: number
  outstanding_amount?: number
}

type PurchaseInvoiceRow = {
  grand_total?: number
  outstanding_amount?: number
}

type PaymentEntryRow = {
  payment_type?: string
  paid_amount?: number
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

export async function fetchEndOfDaySummary(date = new Date()): Promise<{ summary: EndOfDaySummary; activities: EndOfDayActivity[] }> {
  const today = isoDate(date)
  const [sales, purchases, payments, openSales, openPurchases] = await Promise.all([
    getResourceList<SalesInvoiceRow>('Sales Invoice', {
      fields: ['grand_total'],
      filters: [
        ['docstatus', '=', 1],
        ['posting_date', '=', today],
      ],
      limit: 300,
    }),
    getResourceList<PurchaseInvoiceRow>('Purchase Invoice', {
      fields: ['grand_total'],
      filters: [
        ['docstatus', '=', 1],
        ['posting_date', '=', today],
      ],
      limit: 300,
    }),
    getResourceList<PaymentEntryRow>('Payment Entry', {
      fields: ['payment_type', 'paid_amount'],
      filters: [['posting_date', '=', today]],
      limit: 300,
    }),
    getResourceList<SalesInvoiceRow>('Sales Invoice', {
      fields: ['outstanding_amount'],
      filters: [
        ['docstatus', '=', 1],
        ['outstanding_amount', '>', 0],
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
  ])

  const salesTotal = sum(sales.map((row) => row.grand_total ?? 0))
  const purchaseTotal = sum(purchases.map((row) => row.grand_total ?? 0))
  const collectionTotal = sum(payments.filter((row) => row.payment_type === 'Receive').map((row) => row.paid_amount ?? 0))
  const expenseTotal = sum(payments.filter((row) => row.payment_type === 'Pay').map((row) => row.paid_amount ?? 0))
  const openReceivableTotal = sum(openSales.map((row) => row.outstanding_amount ?? 0))
  const openPayableTotal = sum(openPurchases.map((row) => row.outstanding_amount ?? 0))

  const summary: EndOfDaySummary = {
    salesTotal,
    collectionTotal,
    purchaseTotal,
    expenseTotal,
    netCashMovement: collectionTotal - expenseTotal,
    openReceivableTotal,
    openPayableTotal,
  }

  return {
    summary,
    activities: [
      { label: 'Satış', amount: salesTotal, count: sales.length },
      { label: 'Tahsilat', amount: collectionTotal, count: payments.filter((row) => row.payment_type === 'Receive').length },
      { label: 'Alış', amount: purchaseTotal, count: purchases.length },
      { label: 'Ödeme', amount: expenseTotal, count: payments.filter((row) => row.payment_type === 'Pay').length },
    ],
  }
}
