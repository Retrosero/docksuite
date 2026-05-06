import { erpPost } from '../../../services/erpApi'

export type PlanType = 'Starter' | 'Pro' | 'Enterprise'

export type SubscriptionInfo = {
  subscription_name: string
  tenant_id: string
  plan: PlanType
  status: string
  current_period_start: string
  current_period_end: string
  limits: {
    max_users: number
    max_transactions: number
    max_storage_gb: number
  }
  usage: {
    users: number
    transactions: number
    storage_gb: number
  }
  features: string[]
}

export type HealthCheckResult = {
  tenant_id: string
  checked_at: string
  total_checks: number
  passed_checks: number
  failed_checks: number
  overall_status: 'healthy' | 'degraded'
  checks: Array<{
    check_name: string
    status: 'healthy' | 'degraded' | 'unhealthy'
    response_time_ms?: number
    active_users_24h?: number
    transactions_last_hour?: number
    error?: string
  }>
}

export type UsageLimitsResult = {
  has_subscription: boolean
  plan?: PlanType | string
  limits?: {
    users: { limit: number; current: number }
    transactions: { limit: number; current: number }
  }
  within_limits?: boolean
}

export type DiagnosticLogsResult = {
  tenant_id: string
  log_type: string
  count: number
  logs: Array<{
    name: string
    level?: string
    message?: string
    creation?: string
  }>
}

const SAAS_OPS_ENDPOINTS = {
  subscription_info: '/method/shipyard_app.pre_accounting_saas_ops.get_subscription_info',
  update_plan: '/method/shipyard_app.pre_accounting_saas_ops.update_subscription_plan',
  health_check: '/method/shipyard_app.pre_accounting_saas_ops.run_tenant_health_check',
  check_limits: '/method/shipyard_app.pre_accounting_saas_ops.check_usage_limits',
  diagnostic_logs: '/method/shipyard_app.pre_accounting_saas_ops.get_diagnostic_logs',
}

export async function getSubscriptionInfo(subscriptionName: string): Promise<SubscriptionInfo> {
  const response = await erpPost<{ message?: SubscriptionInfo }, { subscription_name: string }>(
    SAAS_OPS_ENDPOINTS.subscription_info,
    { subscription_name: subscriptionName }
  )
  if (!response.message) throw new Error('Abonelik bilgisi alınamadı')
  return response.message
}

export async function updateSubscriptionPlan(subscriptionName: string, newPlan: PlanType): Promise<{
  subscription_name: string
  new_plan: PlanType
  updated_at: string
}> {
  const response = await erpPost<{ message?: unknown }, { subscription_name: string; new_plan: string }>(
    SAAS_OPS_ENDPOINTS.update_plan,
    { subscription_name: subscriptionName, new_plan: newPlan }
  )
  if (!response.message) throw new Error('Plan güncellenemedi')
  return response.message as ReturnType<typeof updateSubscriptionPlan> extends Promise<infer T> ? T : never
}

export async function runHealthCheck(tenantId: string): Promise<HealthCheckResult> {
  const response = await erpPost<{ message?: HealthCheckResult }, { tenant_id: string }>(
    SAAS_OPS_ENDPOINTS.health_check,
    { tenant_id: tenantId }
  )
  if (!response.message) throw new Error('Health check çalıştırılamadı')
  return response.message
}

export async function checkUsageLimits(tenantId: string): Promise<UsageLimitsResult> {
  const response = await erpPost<{ message?: UsageLimitsResult }, { tenant_id: string }>(
    SAAS_OPS_ENDPOINTS.check_limits,
    { tenant_id: tenantId }
  )
  if (!response.message) throw new Error('Limit bilgisi alinamadi')
  return response.message
}

export async function getDiagnosticLogs(
  tenantId: string,
  logType: 'error' | 'warning' | 'info' = 'error',
  limit = 30,
): Promise<DiagnosticLogsResult> {
  const response = await erpPost<{ message?: DiagnosticLogsResult }, { tenant_id: string; log_type: string; limit: number }>(
    SAAS_OPS_ENDPOINTS.diagnostic_logs,
    { tenant_id: tenantId, log_type: logType, limit }
  )
  if (!response.message) throw new Error('Diagnostic log alinamadi')
  return response.message
}

export function formatHealthStatus(status: HealthCheckResult['overall_status']): string {
  const labels: Record<HealthCheckResult['overall_status'], string> = {
    healthy: '✓ Sağlıklı',
    degraded: '⚠ Sorunlu',
  }
  return labels[status]
}

export function getPlanBadgeColor(plan: PlanType): string {
  const colors: Record<PlanType, string> = {
    Starter: 'var(--color-info)',
    Pro: 'var(--color-success)',
    Enterprise: 'var(--color-warning)',
  }
  return colors[plan]
}
