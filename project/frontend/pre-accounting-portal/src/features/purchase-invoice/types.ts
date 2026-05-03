export type PurchaseInvoiceItem = {
  name: string
  supplier: string
  supplier_name?: string
  grand_total?: number
  outstanding_amount?: number
  posting_date?: string
  docstatus: number
}

export type PurchaseInvoiceSummary = {
  totalOpen: number
  openCount: number
  draftCount: number
}
