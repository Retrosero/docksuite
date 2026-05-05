import type { FeatureSettings } from '../config/featureFlags'
import type { TenantConfig } from '../config/tenant'
import type { RoleTemplateKey } from './routes'

export type RoutePageProps = {
  settings: FeatureSettings
  tenantConfig: TenantConfig
  userRoleTemplate: RoleTemplateKey | null
  onToggle: <K extends keyof FeatureSettings>(key: K, value: FeatureSettings[K]) => void
}
