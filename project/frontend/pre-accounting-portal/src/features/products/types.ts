export type ProductItem = {
  name: string
  item_name?: string
  item_group?: string
  stock_uom?: string
  disabled?: number
  totalQty: number
}

export type ProductSummary = {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
}
