export type CustomerItem = {
  name: string
  customer_name?: string
  customer_group?: string
  territory?: string
  disabled?: number
  balance: number
}

export type CustomerSummary = {
  totalCustomers: number
  activeCustomers: number
  openBalance: number
}

export type CustomerType = 'Company' | 'Individual'

export type CustomerForm = {
  customerName: string
  customerType: CustomerType
  customerGroup: string
  territory: string
}

export type CustomerLookupOption = {
  name: string
  label: string
}

export type CustomerInvoiceSummary = {
  invoiceName: string
  postingDate?: string
  grandTotal: number
  outstandingAmount: number
  status: 'Taslak' | 'Kesildi'
}

export type CustomerPurchasedProduct = {
  itemCode: string
  itemName: string
  totalQty: number
  totalAmount: number
}

export type CustomerLedgerMovement = {
  voucherType?: string
  voucherNo?: string
  postingDate?: string
  debit: number
  credit: number
  runningBalance: number
}

export type CustomerNote = {
  name: string
  content: string
  createdAt?: string
  owner?: string
}
