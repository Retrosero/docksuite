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
