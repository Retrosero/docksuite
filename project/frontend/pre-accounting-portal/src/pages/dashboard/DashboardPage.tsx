import type { RoutePageProps } from '../../app/pageProps'
import { DashboardScreen } from '../../features/dashboard/components/DashboardScreen'

export function DashboardPage({ settings }: RoutePageProps) {
  return <DashboardScreen settings={settings} />
}
