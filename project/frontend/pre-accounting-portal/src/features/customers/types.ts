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
