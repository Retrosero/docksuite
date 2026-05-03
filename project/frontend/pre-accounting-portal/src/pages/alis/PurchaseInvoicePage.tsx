import type { RoutePageProps } from '../../app/pageProps'
import { PurchaseInvoiceScreen } from '../../features/purchase-invoice/components/PurchaseInvoiceScreen'

export function PurchaseInvoicePage({ settings }: RoutePageProps) {
  return <PurchaseInvoiceScreen settings={settings} />
}
