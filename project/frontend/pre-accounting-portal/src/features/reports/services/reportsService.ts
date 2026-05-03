import { getResourceList } from '../../../services/erpApi'

type SalesInvoiceRow = { grand_total?: number }
type PurchaseInvoiceRow = { grand_total?: number }
type PaymentEntryRow = { payment_type?: string; paid_amount?: number }
type GlRow = { debit?: number; credit?: number }

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0)
}

export async function fetchReportSummary() {
  const [sales, purchases, payments, gl] = await Promise.all([
    getResourceList<SalesInvoiceRow>('Sales Invoice', { fields: ['grand_total'], filters: [['docstatus', '=', 1]], limit: 500 }),
    getResourceList<PurchaseInvoiceRow>('Purchase Invoice', {
      fields: ['grand_total'],
      filters: [['docstatus', '=', 1]],
      limit: 500,
    }),
    getResourceList<PaymentEntryRow>('Payment Entry', {
      fields: ['payment_type', 'paid_amount'],
      limit: 500,
    }),
    getResourceList<GlRow>('GL Entry', { fields: ['debit', 'credit'], limit: 1000 }),
  ])

  const totalSales = sum(sales.map((row) => row.grand_total ?? 0))
  const totalPurchases = sum(purchases.map((row) => row.grand_total ?? 0))
  const totalCollections = sum(payments.filter((row) => row.payment_type === 'Receive').map((row) => row.paid_amount ?? 0))
  const totalPayments = sum(payments.filter((row) => row.payment_type === 'Pay').map((row) => row.paid_amount ?? 0))
  const netBalance = sum(gl.map((row) => (row.debit ?? 0) - (row.credit ?? 0)))

  return { totalSales, totalPurchases, totalCollections, totalPayments, netBalance }
}
