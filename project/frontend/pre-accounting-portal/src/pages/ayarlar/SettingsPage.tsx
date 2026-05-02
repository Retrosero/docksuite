import type { RoutePageProps } from '../../app/pageProps'
import { SettingsScreen } from '../../features/settings/components/SettingsScreen'

export function SettingsPage({ settings, onToggle }: RoutePageProps) {
  return <SettingsScreen settings={settings} onToggle={onToggle} />
}
