import type { FeatureSettings } from '../config/featureFlags'
import type { TenantConfig } from '../config/tenant'
import type { RoleTemplateKey, ScreenAccessMatrix } from './routes'

export type RoutePageProps = {
  settings: FeatureSettings
  tenantConfig: TenantConfig
  userRoleTemplate: RoleTemplateKey | null
  screenAccessMatrix: ScreenAccessMatrix
  onScreenAccessToggle: (roleTemplate: RoleTemplateKey, routeKey: string, isEnabled: boolean) => Promise<void>
  onToggle: <K extends keyof FeatureSettings>(key: K, value: FeatureSettings[K]) => void
}
