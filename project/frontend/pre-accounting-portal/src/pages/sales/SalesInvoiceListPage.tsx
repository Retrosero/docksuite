import type { RoutePageProps } from '../../app/pageProps'
import { SalesInvoiceScreen } from '../../features/sales-invoice/components/SalesInvoiceScreen'

export function SalesInvoiceListPage({ settings }: RoutePageProps) {
  return <SalesInvoiceScreen settings={settings} />
}
