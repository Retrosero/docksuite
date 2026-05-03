export type TenantConfig = {
  siteName: string
  appTitle: string
  plan: TenantPlan
  locale: 'tr'
  currency: 'TRY'
  timezone: 'Europe/Istanbul'
}

export type TenantPlan = 'temel' | 'ticari' | 'mobil'

export const TENANT_PLAN_LABELS: Record<TenantPlan, string> = {
  temel: 'Temel Plan',
  ticari: 'Ticari Plan',
  mobil: 'Mobil Plan',
}

export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  siteName: 'frontend',
  appTitle: 'On Muhasebe Portal',
  plan: 'ticari',
  locale: 'tr',
  currency: 'TRY',
  timezone: 'Europe/Istanbul',
}
