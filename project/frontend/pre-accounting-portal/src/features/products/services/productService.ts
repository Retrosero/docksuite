import { getResourceList } from '../../../services/erpApi'
import type { ProductItem, ProductSummary } from '../types'

type ItemRow = {
  name: string
  item_name?: string
  item_group?: string
  stock_uom?: string
  disabled?: number
}

type BinRow = {
  item_code?: string
  actual_qty?: number
}

export async function fetchProducts(): Promise<ProductItem[]> {
  const [items, bins] = await Promise.all([
    getResourceList<ItemRow>('Item', {
      fields: ['name', 'item_name', 'item_group', 'stock_uom', 'disabled'],
      orderBy: 'modified desc',
      limit: 250,
    }),
    getResourceList<BinRow>('Bin', {
      fields: ['item_code', 'actual_qty'],
      orderBy: 'modified desc',
      limit: 1500,
    }),
  ])

  const qtyMap = new Map<string, number>()
  for (const bin of bins) {
    if (!bin.item_code) continue
    qtyMap.set(bin.item_code, (qtyMap.get(bin.item_code) ?? 0) + (bin.actual_qty ?? 0))
  }

  return items.map((item) => ({
    ...item,
    totalQty: qtyMap.get(item.name) ?? 0,
  }))
}

export function buildProductSummary(products: ProductItem[]): ProductSummary {
  return {
    totalProducts: products.length,
    activeProducts: products.filter((product) => !product.disabled).length,
    lowStockProducts: products.filter((product) => !product.disabled && product.totalQty < 5).length,
  }
}
