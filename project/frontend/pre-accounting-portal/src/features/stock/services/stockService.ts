import { getResourceList } from '../../../services/erpApi'
import type { StockBinRow, StockItemRow, StockSummary } from '../types'

export async function fetchStockData() {
  const [items, bins] = await Promise.all([
    getResourceList<StockItemRow>('Item', {
      fields: ['name', 'item_name', 'item_group'],
      filters: [['disabled', '=', 0]],
      limit: 300,
      orderBy: 'modified desc',
    }),
    getResourceList<StockBinRow>('Bin', {
      fields: ['item_code', 'warehouse', 'actual_qty'],
      limit: 1000,
      orderBy: 'modified desc',
    }),
  ])

  const qtyByItem = new Map<string, number>()
  const warehouses = new Set<string>()
  for (const row of bins) {
    if (row.item_code) qtyByItem.set(row.item_code, (qtyByItem.get(row.item_code) ?? 0) + (row.actual_qty ?? 0))
    if (row.warehouse) warehouses.add(row.warehouse)
  }

  const lowStockCount = items.filter((item) => (qtyByItem.get(item.name) ?? 0) < 5).length
  const summary: StockSummary = {
    totalItems: items.length,
    activeWarehouses: warehouses.size,
    lowStockCount,
  }

  const table = items.slice(0, 120).map((item) => ({
    ...item,
    totalQty: qtyByItem.get(item.name) ?? 0,
  }))

  return { summary, table }
}
