import type { RoutePageProps } from '../../app/pageProps'
import { CariListScreen } from '../../features/cari/components/CariListScreen'

export function CariListPage({ settings }: RoutePageProps) {
  return <CariListScreen settings={settings} />
}
