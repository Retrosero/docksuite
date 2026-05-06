import { useFeatureSettings } from '../shared/hooks/useFeatureSettings'
import { useTenantConfig } from '../shared/hooks/useTenantConfig'
import { useCurrentUserRole } from '../shared/hooks/useCurrentUserRole'
import { useScreenAccessMatrix } from '../shared/hooks/useScreenAccessMatrix'
import { useActionPermissionMatrix } from '../shared/hooks/useActionPermissionMatrix'
import { AppShell } from './AppShell'
import { useAppRoute } from './useAppRoute'
import { APP_ROUTES, filterAccessibleRoutesWithMatrix, type RoleTemplateKey } from './routes'
import type { ActionKey } from '../shared/hooks/usePermission'

export function App() {
  const { activeRoute, pathname, navigate } = useAppRoute()
  const { settings, isLoading, setSetting } = useFeatureSettings()
  const { tenantConfig, isLoading: isTenantLoading } = useTenantConfig()
  const { roleTemplate, isLoading: isRoleLoading } = useCurrentUserRole()
  const { matrix: screenAccessMatrix, isLoading: isScreenAccessLoading, setRule } = useScreenAccessMatrix()
  const { actionMatrix, limitMatrix, isLoading: isActionPermissionLoading, setActionRule, setLimitRule } = useActionPermissionMatrix()

  const ActivePage = activeRoute.component
  const isAppLoading = isLoading || isTenantLoading || isRoleLoading || isScreenAccessLoading || isActionPermissionLoading
  const accessibleRoutes = filterAccessibleRoutesWithMatrix(APP_ROUTES, roleTemplate, screenAccessMatrix)
  const activeLabel = accessibleRoutes.find((route) => route.path === pathname)?.label ?? activeRoute.label
  const handleScreenAccessToggle = async (nextRoleTemplate: RoleTemplateKey, routeKey: string, isEnabled: boolean) => {
    await setRule(nextRoleTemplate, routeKey, isEnabled)
  }
  const handleActionAccessToggle = async (nextRoleTemplate: RoleTemplateKey, actionKey: ActionKey, isEnabled: boolean) => {
    await setActionRule(nextRoleTemplate, actionKey, isEnabled)
  }
  const handleActionLimitChange = async (actionKey: ActionKey, limitValue: number | null) => {
    await setLimitRule(actionKey, limitValue)
  }

  return (
    <AppShell
      appTitle={tenantConfig.appTitle}
      activePath={pathname}
      activeLabel={activeLabel}
      userRoleTemplate={roleTemplate}
      screenAccessMatrix={screenAccessMatrix}
      onNavigate={navigate}
    >
      {isAppLoading ? (
        <section className="panel">
          <p className="muted">Tenant ayarları yükleniyor...</p>
        </section>
      ) : (
        <ActivePage
          settings={settings}
          tenantConfig={tenantConfig}
          userRoleTemplate={roleTemplate}
          screenAccessMatrix={screenAccessMatrix}
          actionAccessMatrix={actionMatrix}
          actionLimitMatrix={limitMatrix}
          onScreenAccessToggle={handleScreenAccessToggle}
          onActionAccessToggle={handleActionAccessToggle}
          onActionLimitChange={handleActionLimitChange}
          onToggle={setSetting}
        />
      )}
    </AppShell>
  )
}
