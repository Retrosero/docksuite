import { getResourceList } from '../../../services/erpApi'
import type { CatalogItem, CatalogItemBarcode, CatalogFilters, CatalogItemGroup, CatalogSummary } from '../types'

type BinRow = {
  item_code?: string
  actual_qty?: number
}

type ItemGroupRow = {
  name: string
  item_group_name?: string
}

export async function fetchCatalogItems(filters?: CatalogFilters): Promise<CatalogItem[]> {
  const filterConditions: Array<Array<string | number>> = [
    ['is_sales_item', '=', 1],
    ['disabled', '!=', 1],
  ]

  if (filters?.item_group) {
    filterConditions.push(['item_group', '=', filters.item_group])
  }

  if (filters?.has_stock) {
    // Stok filtrelemesi için Bin tablosu ayrı çekilmeli
  }

  const items = await getResourceList<CatalogItem>('Item', {
    fields: [
      'name',
      'item_name',
      'item_group',
      'image',
      'stock_uom',
      'brand',
      'shelf_location',
      'units_per_carton',
      'packaging_type',
      'standard_rate',
      'description',
    ],
    filters: filterConditions,
    orderBy: 'item_name asc',
    limit: 200,
  })

  // Stok miktarlarını al
  const bins = await getResourceList<BinRow>('Bin', {
    fields: ['item_code', 'actual_qty'],
    limit: 1500,
  }).catch(() => [])

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

export async function fetchItemBarcodes(itemCode: string): Promise<CatalogItemBarcode[]> {
  const rows = await getResourceList<CatalogItemBarcode>('Item Barcode', {
    fields: ['barcode', 'barcode_type'],
    filters: [['parent', '=', itemCode]],
  }).catch(() => [])

  return rows
}

export async function fetchCatalogItemGroups(): Promise<CatalogItemGroup[]> {
  const groups = await getResourceList<ItemGroupRow>('Item Group', {
    fields: ['name', 'item_group_name'],
    orderBy: 'item_group_name asc',
    limit: 100,
  })

  return groups.map((group) => ({
    name: group.name,
    label: group.item_group_name || group.name,
  }))
}

export function buildCatalogSummary(items: CatalogItem[]): CatalogSummary {
  return {
    totalItems: items.length,
    inStockItems: items.filter((item) => (item.totalQty ?? 0) > 0).length,
    lowStockItems: items.filter((item) => (item.totalQty ?? 0) > 0 && (item.totalQty ?? 0) < 5).length,
  }
}

export function filterCatalogItems(items: CatalogItem[], filters: CatalogFilters): CatalogItem[] {
  let filtered = [...items]

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchLower) ||
        item.item_name?.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower) ||
        item.shelf_location?.toLowerCase().includes(searchLower)
    )
  }

  if (filters.item_group) {
    filtered = filtered.filter((item) => item.item_group === filters.item_group)
  }

  if (filters.has_stock) {
    filtered = filtered.filter((item) => (item.totalQty ?? 0) > 0)
  }

  return filtered
}