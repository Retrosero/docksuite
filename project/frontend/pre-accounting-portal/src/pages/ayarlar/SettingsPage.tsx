import type { RoutePageProps } from '../../app/pageProps'
import { SettingsScreen } from '../../features/settings/components/SettingsScreen'

export function SettingsPage({ settings, tenantConfig, onToggle }: RoutePageProps) {
  return <SettingsScreen settings={settings} tenantConfig={tenantConfig} onToggle={onToggle} />
}
