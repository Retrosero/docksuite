import type { RoutePageProps } from '../../app/pageProps'
import { SettingsScreen } from '../../features/settings/components/SettingsScreen'

export function SettingsPage({ settings, tenantConfig, screenAccessMatrix, onScreenAccessToggle, onToggle }: RoutePageProps) {
  return (
    <SettingsScreen
      settings={settings}
      tenantConfig={tenantConfig}
      screenAccessMatrix={screenAccessMatrix}
      onScreenAccessToggle={onScreenAccessToggle}
      onToggle={onToggle}
    />
  )
}
