import type { FeatureSettings } from '../config/featureFlags'
import type { TenantConfig } from '../config/tenant'
import type { RoleTemplateKey, ScreenAccessMatrix } from './routes'
import type { ActionAccessMatrix, ActionLimitMatrix } from '../services/actionPermissionService'
import type { ActionKey } from '../shared/hooks/usePermission'

export type RoutePageProps = {
  settings: FeatureSettings
  tenantConfig: TenantConfig
  subdomain?: string
  userRoleTemplate: RoleTemplateKey | null
  screenAccessMatrix: ScreenAccessMatrix
  actionAccessMatrix: ActionAccessMatrix
  actionLimitMatrix: ActionLimitMatrix
  onNavigate: (path: string) => void
  onScreenAccessToggle: (roleTemplate: RoleTemplateKey, routeKey: string, isEnabled: boolean) => Promise<void>
  onActionAccessToggle: (roleTemplate: RoleTemplateKey, actionKey: ActionKey, isEnabled: boolean) => Promise<void>
  onActionLimitChange: (actionKey: ActionKey, limitValue: number | null) => Promise<void>
  onToggle: <K extends keyof FeatureSettings>(key: K, value: FeatureSettings[K]) => void
}
