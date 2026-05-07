import { erpGet } from '../../../services/erpApi'

export type TenantBoundarySmokeResponse = {
  message?: {
    ok: boolean
    tenant_site: string
    session_user: string
    checked_at: string
  }
}

export async function runTenantBoundarySmoke(): Promise<{
  ok: boolean
  tenantSite: string
  sessionUser: string
  checkedAt: string
}> {
  const response = await erpGet<TenantBoundarySmokeResponse>(
    '/method/shipyard_app.stabilization.tenant_boundary_smoke',
  )
  const payload = response.message
  if (!payload) {
    throw new Error('Smoke yaniti alinamadi.')
  }
  return {
    ok: payload.ok,
    tenantSite: payload.tenant_site,
    sessionUser: payload.session_user,
    checkedAt: payload.checked_at,
  }
}

export type HealthCheckResult = {
  ok: boolean
  tenant_site: string
  checked_at: string
  db: { ok: boolean; message: string }
  redis: { ok: boolean; message: string }
}

export async function runHealthCheck(): Promise<HealthCheckResult> {
  const response = await erpGet<{ message?: HealthCheckResult; ok?: boolean }>(
    '/method/shipyard_app.stabilization.health_check',
  )
  if (response.message) return response.message
  return response as unknown as HealthCheckResult
}
