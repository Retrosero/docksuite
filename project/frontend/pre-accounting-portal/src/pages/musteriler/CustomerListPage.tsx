import type { RoutePageProps } from '../../app/pageProps'
import { CustomerListScreen } from '../../features/customers/components/CustomerListScreen'

export function CustomerListPage({ settings }: RoutePageProps) {
  return <CustomerListScreen settings={settings} />
}
