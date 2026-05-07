export type SalesInvoiceItem = {
  name: string
  customer: string
  customer_name?: string
  grand_total?: number
  outstanding_amount?: number
  posting_date?: string
  is_return?: 0 | 1
  return_against?: string
  docstatus: number
  approval_status?: string
}

export type EDocumentReadinessSummary = {
  readyCount: number
  draftCount: number
  totalAmount: number
  latestReadyInvoice?: string
}

export type SalesReturnReadinessSummary = {
  returnableCount: number
  returnInvoiceCount: number
  draftCount: number
  latestReturnableInvoice?: string
}

export type SalesInvoiceForm = {
  customer: string
  items: Array<{
    itemCode: string
    qty: number
    rate: number
    discountPercent: number
  }>
  paymentType: 'Nakit' | 'Vadeli' | 'Havale' | 'Kredi Kartı'
  modeOfPayment?: string
  dueDate?: string
}

export type SalesQuotationItem = {
  name: string
  party_name: string
  customer_name?: string
  transaction_date?: string
  valid_till?: string
  grand_total?: number
  status?: string
  docstatus: number
}

export type QuotationConversionSummary = {
  convertibleCount: number
  convertedCount: number
  draftCount: number
  latestConvertibleQuotation?: string
}

export type SalesQuotationForm = {
  customer: string
  itemCode: string
  qty: number
  rate: number
  validTill: string
}
