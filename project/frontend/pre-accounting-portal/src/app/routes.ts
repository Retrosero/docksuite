import type { ReactElement } from 'react'
import type { RoutePageProps } from './pageProps'
import { SettingsPage } from '../pages/ayarlar/SettingsPage'
import { CariListPage } from '../pages/cari/CariListPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { ExpenseListPage } from '../pages/gider/ExpenseListPage'
import { ReportsPage } from '../pages/raporlar/ReportsPage'
import { SalesInvoiceListPage } from '../pages/sales/SalesInvoiceListPage'
import { StockOverviewPage } from '../pages/stok/StockOverviewPage'
import { CollectionEntryPage } from '../pages/tahsilat/CollectionEntryPage'

export type AppRoute = {
  key: string
  label: string
  path: string
  component: (props: RoutePageProps) => ReactElement
}

export const APP_ROUTES: AppRoute[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/', component: DashboardPage },
  { key: 'cari', label: 'Cari', path: '/cari', component: CariListPage },
  { key: 'satis', label: 'Satis Faturalari', path: '/satis', component: SalesInvoiceListPage },
  { key: 'tahsilat', label: 'Tahsilat', path: '/tahsilat', component: CollectionEntryPage },
  { key: 'gider', label: 'Gider', path: '/gider', component: ExpenseListPage },
  { key: 'stok', label: 'Stok', path: '/stok', component: StockOverviewPage },
  { key: 'raporlar', label: 'Raporlar', path: '/raporlar', component: ReportsPage },
  { key: 'ayarlar', label: 'Ayarlar', path: '/ayarlar', component: SettingsPage },
]

export function findRoute(pathname: string): AppRoute {
  return APP_ROUTES.find((route) => route.path === pathname) ?? APP_ROUTES[0]
}
