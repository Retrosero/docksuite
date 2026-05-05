import type { RoutePageProps } from '../../app/pageProps'
import { UserManagementScreen } from '../../features/users/components/UserManagementScreen'

export function UserManagementPage({ settings }: RoutePageProps) {
  return <UserManagementScreen settings={settings} />
}
