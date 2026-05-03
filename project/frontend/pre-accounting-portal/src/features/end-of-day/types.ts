export type EndOfDaySummary = {
  salesTotal: number
  collectionTotal: number
  purchaseTotal: number
  expenseTotal: number
  netCashMovement: number
  openReceivableTotal: number
  openPayableTotal: number
}

export type EndOfDayActivity = {
  label: string
  amount: number
  count: number
}
