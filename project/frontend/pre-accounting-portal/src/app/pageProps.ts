import type { FeatureSettings } from '../config/featureFlags'
import type { TenantConfig } from '../config/tenant'

export type RoutePageProps = {
  settings: FeatureSettings
  tenantConfig: TenantConfig
  onToggle: <K extends keyof FeatureSettings>(key: K, value: FeatureSettings[K]) => void
}
