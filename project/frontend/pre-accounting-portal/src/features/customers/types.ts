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
