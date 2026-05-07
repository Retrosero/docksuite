import type { RoutePageProps } from '../../app/pageProps'
import { CatalogScreen } from '../../features/catalog/components/CatalogScreen'

export function CatalogPage({ settings }: RoutePageProps) {
  return <CatalogScreen settings={settings} />
}