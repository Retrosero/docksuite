export type TenantConfig = {
  siteName: string
  appTitle: string
  locale: 'tr'
  currency: 'TRY'
  timezone: 'Europe/Istanbul'
}

export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  siteName: 'frontend',
  appTitle: 'On Muhasebe Portal',
  locale: 'tr',
  currency: 'TRY',
  timezone: 'Europe/Istanbul',
}
