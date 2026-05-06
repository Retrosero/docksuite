import type { RoutePageProps } from '../../app/pageProps'
import { SettingsScreen } from '../../features/settings/components/SettingsScreen'

export function SettingsPage({
  settings,
  tenantConfig,
  screenAccessMatrix,
  actionAccessMatrix,
  actionLimitMatrix,
  onScreenAccessToggle,
  onActionAccessToggle,
  onActionLimitChange,
  onToggle,
}: RoutePageProps) {
  return (
    <SettingsScreen
      settings={settings}
      tenantConfig={tenantConfig}
      screenAccessMatrix={screenAccessMatrix}
      actionAccessMatrix={actionAccessMatrix}
      actionLimitMatrix={actionLimitMatrix}
      onScreenAccessToggle={onScreenAccessToggle}
      onActionAccessToggle={onActionAccessToggle}
      onActionLimitChange={onActionLimitChange}
      onToggle={onToggle}
    />
  )
}
