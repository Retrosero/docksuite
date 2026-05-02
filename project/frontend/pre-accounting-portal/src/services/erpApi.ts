import { DEFAULT_TENANT_CONFIG } from '../config/tenant'

const API_BASE = '/api'

export type FrappeListResponse<T> = {
  data: T[]
}

export type ResourceQuery = {
  fields?: string[]
  filters?: unknown
  orderBy?: string
  limit?: number
}

export async function erpGet<T>(resourcePath: string): Promise<T> {
  const response = await fetch(`${API_BASE}${resourcePath}`, {
    headers: {
      Accept: 'application/json',
      'X-Frappe-Site-Name': DEFAULT_TENANT_CONFIG.siteName,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('ERP istegi basarisiz oldu.')
  }

  return (await response.json()) as T
}

function toQueryString(query: ResourceQuery): string {
  const params = new URLSearchParams()
  if (query.fields?.length) {
    params.set('fields', JSON.stringify(query.fields))
  }
  if (query.filters) {
    params.set('filters', JSON.stringify(query.filters))
  }
  if (query.orderBy) {
    params.set('order_by', query.orderBy)
  }
  if (typeof query.limit === 'number') {
    params.set('limit_page_length', String(query.limit))
  }
  return params.toString()
}

export async function getResourceList<T>(doctype: string, query: ResourceQuery = {}): Promise<T[]> {
  const qs = toQueryString(query)
  const path = `/resource/${encodeURIComponent(doctype)}${qs ? `?${qs}` : ''}`
  const response = await erpGet<FrappeListResponse<T>>(path)
  return response.data ?? []
}
