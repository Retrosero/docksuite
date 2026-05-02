import { getResourceList } from '../../../services/erpApi'

type SalesInvoiceRow = { grand_total?: number }
type PaymentEntryRow = { paid_amount?: number }
type GlRow = { debit?: number; credit?: number }

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0)
}

export async function fetchReportSummary() {
  const [sales, collections, gl] = await Promise.all([
    getResourceList<SalesInvoiceRow>('Sales Invoice', { fields: ['grand_total'], filters: [['docstatus', '=', 1]], limit: 500 }),
    getResourceList<PaymentEntryRow>('Payment Entry', {
      fields: ['paid_amount'],
      filters: [['payment_type', '=', 'Receive']],
      limit: 500,
    }),
    getResourceList<GlRow>('GL Entry', { fields: ['debit', 'credit'], limit: 1000 }),
  ])

  const totalSales = sum(sales.map((row) => row.grand_total ?? 0))
  const totalCollections = sum(collections.map((row) => row.paid_amount ?? 0))
  const netBalance = sum(gl.map((row) => (row.debit ?? 0) - (row.credit ?? 0)))

  return { totalSales, totalCollections, netBalance }
}
