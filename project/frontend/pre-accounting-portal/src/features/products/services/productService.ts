import { createResource, erpGet, getResourceList } from '../../../services/erpApi'
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
  warehouse?: string
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
  const items = await getResourceList<ItemRow>('Item', {
    fields: ['name', 'item_name', 'item_group', 'stock_uom', 'disabled'],
    orderBy: 'modified desc',
    limit: 250,
  })
  const bins = await getResourceList<BinRow>('Bin', {
    fields: ['item_code', 'actual_qty'],
    orderBy: 'modified desc',
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

type ItemPriceRow = {
  name: string
  item_code: string
  price_list: string
  price_list_rate: number
  currency: string
}

export async function getItemPrice(itemCode: string): Promise<{ price: number; currency: string } | null> {
  try {
    const prices = await getResourceList<ItemPriceRow>('Item Price', {
      fields: ['name', 'item_code', 'price_list', 'price_list_rate', 'currency'],
      filters: [['item_code', '=', itemCode]],
      limit: 10,
    })
    const sellingPrice = prices.find((p) => p.price_list === 'Standard Selling')
    if (sellingPrice) {
      return { price: sellingPrice.price_list_rate, currency: sellingPrice.currency }
    }
    if (prices.length > 0) {
      return { price: prices[0].price_list_rate, currency: prices[0].currency }
    }
    return null
  } catch {
    return null
  }
}

export async function updateItemPrice(itemCode: string, price: number, currency = 'TRY'): Promise<boolean> {
  try {
    const prices = await getResourceList<ItemPriceRow>('Item Price', {
      fields: ['name', 'item_code', 'price_list', 'price_list_rate'],
      filters: [['item_code', '=', itemCode], ['price_list', '=', 'Standard Selling']],
      limit: 1,
    })

    if (prices.length > 0) {
      const itemPriceName = prices[0].name
      console.log('Updating Item Price:', itemPriceName, 'with price:', price)
      const encodedDoctype = encodeURIComponent('Item Price')
      const encodedName = encodeURIComponent(itemPriceName)
      const result = await erpPost<{ data: ItemPriceRow }>(`/resource/${encodedDoctype}/${encodedName}`, {
        doctype: 'Item Price',
        price_list_rate: price,
      })
      console.log('Update result:', result)
    } else {
      console.log('Creating new Item Price for:', itemCode, 'with price:', price)
      await createResource<{
        item_code: string
        price_list: string
        price_list_rate: number
        currency: string
        buying: number
        selling: number
        uom: string
      }>('Item Price', {
        item_code: itemCode,
        price_list: 'Standard Selling',
        price_list_rate: price,
        currency,
        buying: 0,
        selling: 1,
        uom: 'Nos',
      })
    }
    return true
  } catch (e) {
    console.error('Failed to update item price:', e)
    return false
  }
}

export async function getStockBalance(itemCode: string): Promise<{ warehouse: string; qty: number }[]> {
  try {
    const bins = await getResourceList<BinRow>('Bin', {
      fields: ['item_code', 'actual_qty', 'warehouse'],
      filters: [['item_code', '=', itemCode]],
      limit: 50,
    })
    return bins.map((b) => ({
      warehouse: b.warehouse,
      qty: b.actual_qty,
    }))
  } catch {
    return []
  }
}

function erpPost<T>(resourcePath: string, body: Record<string, unknown> = {}): Promise<T> {
  const csrfToken = typeof document !== 'undefined'
    ? document.cookie.split('; ').find((row) => row.startsWith('csrf_token='))?.split('=')[1] || ''
    : ''
  const isPut = resourcePath.includes('/resource/') && !resourcePath.includes('method')
  return fetch(`/api${resourcePath}`, {
    method: isPut ? 'PUT' : 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Frappe-Site-Name': 'frontend',
      ...(csrfToken ? { 'X-Frappe-CSRF-Token': csrfToken } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(body),
  }).then((r) => {
    if (!r.ok) {
      return r.text().then((text) => {
        console.error('ERP Error:', r.status, text)
        throw new Error(`HTTP ${r.status}: ${text}`)
      })
    }
    return r.json()
  }) as Promise<T>
}

export async function refreshCsrfToken(): Promise<string> {
  try {
    const response = await fetch('/api/method/frappe.security.csrf_token_manager.get_token', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Frappe-Site-Name': 'frontend',
      },
    })
    const data = await response.json() as { message?: string }
    return data.message || ''
  } catch {
    return ''
  }
}
