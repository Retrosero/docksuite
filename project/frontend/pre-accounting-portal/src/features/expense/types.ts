export type PurchaseInvoiceItem = {
  name: string
  supplier: string
  supplier_name?: string
  grand_total?: number
  outstanding_amount?: number
  due_date?: string
  docstatus: number
}

export type SupplierPaymentItem = {
  name: string
  party?: string
  paid_amount?: number
  mode_of_payment?: string
  docstatus: number
}

export type ExpenseForm = {
  supplier: string
  itemCode: string
  qty: number
  rate: number
}

export type SupplierPaymentForm = {
  supplier: string
  paidAmount: number
  modeOfPayment: string
}
