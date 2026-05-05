import { erpGet, erpPost } from '../../../services/erpApi'

export type TenantInfo = {
  name: string
  subdomain: string
  company_name: string
  email: string
  phone?: string
  tax_id?: string
  address?: string
  status: 'Trial' | 'Active' | 'Suspended'
  trial_ends?: string
  activation_date?: string
  creation: string
}

export type TenantFormData = {
  company_name: string
  subdomain: string
  email: string
  phone?: string
  tax_id?: string
  address?: string
}

type TenantResponse = {
  message?: TenantInfo | TenantInfo[]
}

type CreateTenantResponse = {
  message?: {
    name: string
    subdomain: string
    status: string
    setup_url: string
  }
}

const TENANT_ENDPOINTS = {
  list: '/method/shipyard_app.pre_accounting_tenant.list_tenants',
  create: '/method/shipyard_app.pre_accounting_tenant.create_tenant',
  activate: '/method/shipyard_app.pre_accounting_tenant.activate_tenant',
  suspend: '/method/shipyard_app.pre_accounting_tenant.suspend_tenant',
  info: '/method/shipyard_app.pre_accounting_tenant.get_tenant_info',
}

export async function fetchTenantList(status?: string): Promise<TenantInfo[]> {
  const params = status ? `?status=${status}` : ''
  const response = await erpGet<TenantResponse>(`${TENANT_ENDPOINTS.list}${params}`)
  return Array.isArray(response.message) ? response.message : []
}

export async function createTenant(data: TenantFormData): Promise<CreateTenantResponse['message']> {
  const response = await erpPost<CreateTenantResponse, TenantFormData>(TENANT_ENDPOINTS.create, data)
  return response.message
}

export async function activateTenant(subdomain: string): Promise<boolean> {
  const response = await erpPost<{ message?: { status: string } }, { subdomain: string }>(
    TENANT_ENDPOINTS.activate,
    { subdomain }
  )
  return response.message?.status === 'Active'
}

export async function suspendTenant(subdomain: string, reason?: string): Promise<boolean> {
  const response = await erpPost<{ message?: { status: string } }, { subdomain: string; reason?: string }>(
    TENANT_ENDPOINTS.suspend,
    { subdomain, reason }
  )
  return response.message?.status === 'Suspended'
}

export async function fetchTenantInfo(subdomain: string): Promise<TenantInfo | null> {
  const response = await erpPost<TenantResponse, { subdomain: string }>(TENANT_ENDPOINTS.info, { subdomain })
  return response.message as TenantInfo | null
}

export function validateSubdomain(subdomain: string): string | null {
  if (!subdomain) return 'Subdomain zorunludur'
  if (!/^[a-z0-9-]+$/.test(subdomain)) return 'Sadece küçük harf, rakam ve tire kullanılabilir'
  if (subdomain.length < 3) return 'En az 3 karakter gerekli'
  if (subdomain.length > 30) return 'En fazla 30 karakter olabilir'
  return null
}

export function formatTenantStatus(status: TenantInfo['status']): string {
  const labels: Record<TenantInfo['status'], string> = {
    'Trial': 'Deneme',
    'Active': 'Aktif',
    'Suspended': 'Askıya Alındı',
  }
  return labels[status] ?? status
}
