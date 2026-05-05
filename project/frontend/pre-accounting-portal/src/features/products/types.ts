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

export type ProductForm = {
  itemCode: string
  itemName: string
  itemGroup: string
  stockUom: string
  isStockItem: boolean
}

export type ProductLookupOption = {
  name: string
  label: string
}
