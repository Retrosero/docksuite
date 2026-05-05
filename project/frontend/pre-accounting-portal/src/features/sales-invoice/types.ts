export type SalesInvoiceItem = {
  name: string
  customer: string
  customer_name?: string
  grand_total?: number
  outstanding_amount?: number
  docstatus: number
}

export type SalesInvoiceForm = {
  customer: string
  itemCode: string
  qty: number
  rate: number
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

export type SalesQuotationForm = {
  customer: string
  itemCode: string
  qty: number
  rate: number
  validTill: string
}
