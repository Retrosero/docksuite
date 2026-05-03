import type { RoutePageProps } from '../../app/pageProps'
import { ProductListScreen } from '../../features/products/components/ProductListScreen'

export function ProductListPage({ settings }: RoutePageProps) {
  return <ProductListScreen settings={settings} />
}
