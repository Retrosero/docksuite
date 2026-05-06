import { useFeatureSettings } from '../shared/hooks/useFeatureSettings'
import { useTenantConfig } from '../shared/hooks/useTenantConfig'
import { useCurrentUserRole } from '../shared/hooks/useCurrentUserRole'
import { useScreenAccessMatrix } from '../shared/hooks/useScreenAccessMatrix'
import { AppShell } from './AppShell'
import { useAppRoute } from './useAppRoute'
import { APP_ROUTES, filterAccessibleRoutesWithMatrix, type RoleTemplateKey } from './routes'

export function App() {
  const { activeRoute, pathname, navigate } = useAppRoute()
  const { settings, isLoading, setSetting } = useFeatureSettings()
  const { tenantConfig, isLoading: isTenantLoading } = useTenantConfig()
  const { roleTemplate, isLoading: isRoleLoading } = useCurrentUserRole()
  const { matrix: screenAccessMatrix, isLoading: isScreenAccessLoading, setRule } = useScreenAccessMatrix()

  const ActivePage = activeRoute.component
  const isAppLoading = isLoading || isTenantLoading || isRoleLoading || isScreenAccessLoading
  const accessibleRoutes = filterAccessibleRoutesWithMatrix(APP_ROUTES, roleTemplate, screenAccessMatrix)
  const activeLabel = accessibleRoutes.find((route) => route.path === pathname)?.label ?? activeRoute.label
  const handleScreenAccessToggle = async (nextRoleTemplate: RoleTemplateKey, routeKey: string, isEnabled: boolean) => {
    await setRule(nextRoleTemplate, routeKey, isEnabled)
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
          onScreenAccessToggle={handleScreenAccessToggle}
          onToggle={setSetting}
        />
      )}
    </AppShell>
  )
}
