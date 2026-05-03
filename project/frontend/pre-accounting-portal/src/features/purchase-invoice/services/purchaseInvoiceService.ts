import { getResourceList } from '../../../services/erpApi'
import type { PurchaseInvoiceItem, PurchaseInvoiceSummary } from '../types'

export async function fetchPurchaseInvoices(): Promise<PurchaseInvoiceItem[]> {
  return getResourceList<PurchaseInvoiceItem>('Purchase Invoice', {
    fields: ['name', 'supplier', 'supplier_name', 'grand_total', 'outstanding_amount', 'posting_date', 'docstatus'],
    orderBy: 'modified desc',
    limit: 100,
  })
}

export function buildPurchaseInvoiceSummary(rows: PurchaseInvoiceItem[]): PurchaseInvoiceSummary {
  return {
    totalOpen: rows.reduce((sum, row) => sum + (row.outstanding_amount ?? 0), 0),
    openCount: rows.filter((row) => (row.outstanding_amount ?? 0) > 0).length,
    draftCount: rows.filter((row) => row.docstatus === 0).length,
  }
}
