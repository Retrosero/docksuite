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

export async function erpPost<TResponse, TPayload>(resourcePath: string, payload: TPayload): Promise<TResponse> {
  const response = await fetch(`${API_BASE}${resourcePath}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Frappe-Site-Name': DEFAULT_TENANT_CONFIG.siteName,
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let errorMessage = 'ERP kayit islemi basarisiz oldu.'
    try {
      const errorData = await response.json()
      if (errorData?.exception) {
        errorMessage = errorData.exception
      } else if (errorData?.message) {
        errorMessage = errorData.message
      }
    } catch {
      // JSON parse basarisiz, default mesaji kullan
    }
    throw new Error(errorMessage)
  }

  return (await response.json()) as TResponse
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

export async function createResource<
  TDoc extends Record<string, unknown>,
  TResponse extends Record<string, unknown> = TDoc,
>(
  doctype: string,
  doc: TDoc,
) : Promise<TResponse> {
  const response = await erpPost<{ data: TResponse }, { doctype: string } & TDoc>(
    `/resource/${encodeURIComponent(doctype)}`,
    {
    doctype,
    ...doc,
    },
  )
  return response.data
}
