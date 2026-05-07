import { createResource, getResourceList, erpPost } from '../../../services/erpApi'
import { DEFAULT_TENANT_CONFIG } from '../../../config/tenant'

export type StockEntryItem = {
  item_code: string
  qty: number
  basic_rate?: number
  t_warehouse?: string
}

export type StockEntryPayload = {
  purpose: 'Material Receipt' | 'Material Issue' | 'Material Transfer'
  company: string
  from_warehouse?: string
  to_warehouse?: string
  items: StockEntryItem[]
}

export type StockEntryResult = {
  name?: string
  success: boolean
  error?: string
}

/**
 * Tüm warehouse'ları listeler
 */
export async function fetchWarehouses(): Promise<Array<{ name: string; warehouse_name?: string }>> {
  return getResourceList('Warehouse', {
    fields: ['name', 'warehouse_name'],
    orderBy: 'warehouse_name asc',
    limit: 100,
  })
}

/**
 * Stock Entry (Malzeme Girişi) oluşturur
 * Stok eklemek için "Material Receipt" purpose kullanılır
 */
export async function createStockEntry(
  items: Array<{ itemCode: string; qty: number; rate?: number }>,
  targetWarehouse: string,
  purpose: 'Material Receipt' = 'Material Receipt'
): Promise<StockEntryResult> {
  try {
    const company = DEFAULT_TENANT_CONFIG.siteName || 'My Company'
    
    const payload: StockEntryPayload = {
      purpose,
      company,
      to_warehouse: targetWarehouse,
      items: items.map((item) => ({
        item_code: item.itemCode,
        qty: item.qty,
        basic_rate: item.rate,
        t_warehouse: targetWarehouse,
      })),
    }

    console.log('Creating Stock Entry with payload:', JSON.stringify(payload, null, 2))

    const result = await createResource<StockEntryPayload, { name?: string }>(
      'Stock Entry',
      payload
    )

    console.log('Stock Entry created:', result.name)

    return {
      name: result.name,
      success: true,
    }
  } catch (error) {
    console.error('Stock Entry creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
    }
  }
}

/**
 * Tek bir ürüne stok ekler (Material Receipt)
 */
export async function addStockToItem(
  itemCode: string,
  qty: number,
  targetWarehouse: string,
  rate?: number
): Promise<StockEntryResult> {
  return createStockEntry([{ itemCode, qty, rate }], targetWarehouse, 'Material Receipt')
}

/**
 * Birden fazla ürüne toplu stok ekler (tek Stock Entry içinde)
 */
export async function addBulkStock(
  items: Array<{ itemCode: string; qty: number; rate?: number }>,
  targetWarehouse: string
): Promise<StockEntryResult> {
  return createStockEntry(items, targetWarehouse, 'Material Receipt')
}