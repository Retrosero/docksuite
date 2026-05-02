import type { RoutePageProps } from '../../app/pageProps'
import { StockOverviewScreen } from '../../features/stock/components/StockOverviewScreen'

export function StockOverviewPage({ settings }: RoutePageProps) {
  return <StockOverviewScreen settings={settings} />
}
