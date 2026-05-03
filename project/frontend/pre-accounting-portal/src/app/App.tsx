import { useFeatureSettings } from '../shared/hooks/useFeatureSettings'
import { useTenantConfig } from '../shared/hooks/useTenantConfig'
import { AppShell } from './AppShell'
import { useAppRoute } from './useAppRoute'

export function App() {
  const { activeRoute, pathname, navigate } = useAppRoute()
  const { settings, isLoading, setSetting } = useFeatureSettings()
  const { tenantConfig, isLoading: isTenantLoading } = useTenantConfig()

  const ActivePage = activeRoute.component
  const isAppLoading = isLoading || isTenantLoading

  return (
    <AppShell
      appTitle={tenantConfig.appTitle}
      activePath={pathname}
      activeLabel={activeRoute.label}
      onNavigate={navigate}
    >
      {isAppLoading ? (
        <section className="panel">
          <p className="muted">Tenant ayarları yükleniyor...</p>
        </section>
      ) : (
        <ActivePage settings={settings} tenantConfig={tenantConfig} onToggle={setSetting} />
      )}
    </AppShell>
  )
}
