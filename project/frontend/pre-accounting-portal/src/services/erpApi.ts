import { DEFAULT_TENANT_CONFIG } from '../config/tenant'

const API_BASE = '/api'

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
