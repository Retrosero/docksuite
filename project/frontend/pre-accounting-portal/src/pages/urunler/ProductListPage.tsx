import type { RoutePageProps } from '../../app/pageProps'
import { ProductListScreen } from '../../features/products/components/ProductListScreen'

export function ProductListPage({ settings, onNavigate }: RoutePageProps) {
  return <ProductListScreen settings={settings} onNavigate={onNavigate} />
}
