import type { RoutePageProps } from '../../app/pageProps'
import { CashBankScreen } from '../../features/cash-bank/components/CashBankScreen'

export function CashBankPage({ settings }: RoutePageProps) {
  return <CashBankScreen settings={settings} />
}
