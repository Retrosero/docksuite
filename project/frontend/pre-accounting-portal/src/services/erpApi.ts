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

function getCsrfTokenFromCookie(): string {
  if (typeof document === 'undefined') return ''
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf_token='))
    ?.split('=')[1]
  return token ? decodeURIComponent(token) : ''
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
    let errorMessage = 'ERP istegi basarisiz oldu.'
    try {
      const errorData = await response.json() as Record<string, unknown>
      errorMessage = extractFrappeError(errorData)
    } catch {
      errorMessage = `HTTP ${response.status}: Sunucuya ulasilamadi`
    }
    throw new Error(errorMessage)
  }

  return (await response.json()) as T
}

function extractFrappeError(errorData: Record<string, unknown>): string {
  // 1. _server_messages: Frappe'in JSON encode edilmis mesajlari
  const serverMessages = errorData._server_messages
  if (serverMessages) {
    try {
      const parsed = JSON.parse(String(serverMessages))
      if (Array.isArray(parsed)) {
        // Mesajlar array seklinde
        const messages = parsed.map((m) => {
          if (typeof m === 'string') return m
          if (m && typeof m === 'object' && 'message' in m) return String((m as { message: string }).message)
          return ''
        }).filter(Boolean)
        if (messages.length > 0) return messages.join('; ')
      } else if (typeof parsed === 'string') {
        return parsed
      }
    } catch {
      // JSON parse edilemedi, string olarak kullan
      return String(serverMessages)
    }
  }

  // 2. exception: Python traceback iceren hata
  const exception = errorData.exception
  if (exception) {
    const excStr = String(exception)
    // Traceback'ten sadece mesaji cikar
    if (excStr.includes(':')) {
      // "ValidationError: Field 'X' is required" gibi
      const parts = excStr.split(':')
      return parts[parts.length - 1].trim() || excStr
    }
    return excStr
  }

  // 3. message: Dogrudan mesaj
  const message = errorData.message
  if (message) {
    return String(message)
  }

  // 4. Hicbiri yoksa
  return 'Bilinmeyen hata'
}

export async function erpPost<TResponse, TPayload>(resourcePath: string, payload: TPayload): Promise<TResponse> {
  const csrfToken = getCsrfTokenFromCookie()
  const response = await fetch(`${API_BASE}${resourcePath}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Frappe-Site-Name': DEFAULT_TENANT_CONFIG.siteName,
      ...(csrfToken ? { 'X-Frappe-CSRF-Token': csrfToken } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let errorMessage = 'ERP kayit islemi basarisiz oldu.'
    try {
      const errorData = await response.json() as Record<string, unknown>
      errorMessage = extractFrappeError(errorData)
    } catch {
      // JSON parse basarisiz, default mesaji kullan
      errorMessage = `HTTP ${response.status}: Islem basarisiz`
    }
    throw new Error(errorMessage)
  }

  return (await response.json()) as TResponse
}

export async function getLoggedUser(): Promise<string> {
  const response = await erpGet<{ message?: string }>('/method/frappe.auth.get_logged_user')
  return String(response.message || 'Guest')
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
  // Token yenile
  await refreshCsrfToken()
  
  const response = await erpPost<{ data: TResponse }, { doctype: string } & TDoc>(
    `/resource/${encodeURIComponent(doctype)}`,
    {
    doctype,
    ...doc,
    },
  )
  return response.data
}

export async function refreshCsrfToken(): Promise<string> {
  try {
    const response = await fetch('/api/method/frappe.security.csrf_token_manager.get_token', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Frappe-Site-Name': DEFAULT_TENANT_CONFIG.siteName,
      },
    })
    const data = await response.json() as { message?: string; csrf_token?: string }
    const newToken = data.csrf_token || data.message || ''
    
    // Token'ı cookie'ye yaz
    if (newToken && typeof document !== 'undefined') {
      document.cookie = `csrf_token=${encodeURIComponent(newToken)}; path=/; SameSite=Lax`
    }
    
    return newToken
  } catch {
    return ''
  }
}
