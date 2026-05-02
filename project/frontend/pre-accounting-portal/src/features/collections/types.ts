export type PaymentEntryItem = {
  name: string
  party?: string
  paid_amount?: number
  mode_of_payment?: string
  docstatus: number
}

export type PaymentEntryForm = {
  party: string
  paidAmount: number
  modeOfPayment: string
}
