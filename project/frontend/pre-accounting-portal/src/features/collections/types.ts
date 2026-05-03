export type PaymentEntryItem = {
  name: string
  party?: string
  paid_amount?: number
  mode_of_payment?: string
  docstatus: number
  reference_invoice?: string
  closure_status?: 'Tam Kapandı' | 'Kısmi Tahsilat' | '-'
}

export type PaymentEntryForm = {
  party: string
  referenceInvoice: string
  paidAmount: number
  modeOfPayment: string
}

export type OpenSalesInvoiceItem = {
  name: string
  posting_date?: string
  outstanding_amount?: number
  grand_total?: number
}
