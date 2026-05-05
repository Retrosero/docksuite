import { createResource, getResourceList } from '../../../services/erpApi'
import type { ProductForm, ProductItem, ProductLookupOption, ProductSummary } from '../types'

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

type ItemGroupRow = {
  name: string
  item_group_name?: string
}

type UomRow = {
  name: string
  uom_name?: string
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

export async function fetchItemGroups(): Promise<ProductLookupOption[]> {
  const groups = await getResourceList<ItemGroupRow>('Item Group', {
    fields: ['name', 'item_group_name'],
    orderBy: 'name asc',
    limit: 100,
  })

  return groups.map((group) => ({ name: group.name, label: group.item_group_name || group.name }))
}

export async function fetchUoms(): Promise<ProductLookupOption[]> {
  const uoms = await getResourceList<UomRow>('UOM', {
    fields: ['name', 'uom_name'],
    orderBy: 'name asc',
    limit: 100,
  })

  return uoms.map((uom) => ({ name: uom.name, label: uom.uom_name || uom.name }))
}

export async function createProductCard(form: ProductForm): Promise<string> {
  const created = await createResource<
    {
      item_code: string
      item_name: string
      item_group: string
      stock_uom: string
      is_stock_item: 0 | 1
    },
    { name?: string }
  >('Item', {
    item_code: form.itemCode,
    item_name: form.itemName,
    item_group: form.itemGroup,
    stock_uom: form.stockUom,
    is_stock_item: form.isStockItem ? 1 : 0,
  })

  return String(created.name ?? '')
}
