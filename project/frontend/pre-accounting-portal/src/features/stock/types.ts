export type StockItemRow = {
  name: string
  item_name?: string
  item_group?: string
}

export type StockBinRow = {
  item_code?: string
  warehouse?: string
  actual_qty?: number
}

export type StockSummary = {
  totalItems: number
  activeWarehouses: number
  lowStockCount: number
}
