import { DEFAULT_TENANT_CONFIG } from '../config/tenant'
import { useFeatureSettings } from '../shared/hooks/useFeatureSettings'
import { AppShell } from './AppShell'
import { useAppRoute } from './useAppRoute'

export function App() {
  const { activeRoute, pathname, navigate } = useAppRoute()
  const { settings, isLoading, setSetting } = useFeatureSettings()

  const ActivePage = activeRoute.component

  return (
    <AppShell
      appTitle={DEFAULT_TENANT_CONFIG.appTitle}
      activePath={pathname}
      activeLabel={activeRoute.label}
      onNavigate={navigate}
    >
      {isLoading ? (
        <section className="panel">
          <p className="muted">Ayarlar yükleniyor...</p>
        </section>
      ) : (
        <ActivePage settings={settings} tenantConfig={DEFAULT_TENANT_CONFIG} onToggle={setSetting} />
      )}
    </AppShell>
  )
}
