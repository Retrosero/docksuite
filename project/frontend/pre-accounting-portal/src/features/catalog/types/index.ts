// Catalog Module Types

export type CatalogItem = {
  name: string
  item_name?: string
  item_group?: string
  image?: string
  stock_uom?: string
  brand?: string
  shelf_location?: string
  units_per_carton?: number
  packaging_type?: string
  standard_rate?: number
  totalQty?: number
  description?: string
  disabled?: number
}

export type CatalogItemBarcode = {
  barcode: string
  barcode_type?: string
}

export type CatalogFilters = {
  search?: string
  item_group?: string
  brand?: string
  has_stock?: boolean
}

export type CatalogItemGroup = {
  name: string
  label: string
}

export type CatalogSummary = {
  totalItems: number
  inStockItems: number
  lowStockItems: number
}

export type AddToCartItem = {
  itemCode: string
  qty: number
  rate: number
}