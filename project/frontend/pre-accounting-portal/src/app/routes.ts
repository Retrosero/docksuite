import type { ReactElement } from 'react'
import type { RoutePageProps } from './pageProps'
import { PurchaseInvoicePage } from '../pages/alis/PurchaseInvoicePage'
import { SettingsPage } from '../pages/ayarlar/SettingsPage'
import { CariListPage } from '../pages/cari/CariListPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { ExpenseListPage } from '../pages/gider/ExpenseListPage'
import { EndOfDayPage } from '../pages/gun-sonu/EndOfDayPage'
import { CashBankPage } from '../pages/kasa-banka/CashBankPage'
import { CustomerListPage } from '../pages/musteriler/CustomerListPage'
import { ReportsPage } from '../pages/raporlar/ReportsPage'
import { SalesInvoiceListPage } from '../pages/sales/SalesInvoiceListPage'
import { StockOverviewPage } from '../pages/stok/StockOverviewPage'
import { CollectionEntryPage } from '../pages/tahsilat/CollectionEntryPage'
import { ProductListPage } from '../pages/urunler/ProductListPage'

export type AppRoute = {
  key: string
  label: string
  path: string
  component: (props: RoutePageProps) => ReactElement
}

export const APP_ROUTES: AppRoute[] = [
  { key: 'dashboard', label: 'Genel Bakış', path: '/', component: DashboardPage },
  { key: 'cari', label: 'Cari', path: '/cari', component: CariListPage },
  { key: 'musteriler', label: 'Müşteriler', path: '/musteriler', component: CustomerListPage },
  { key: 'urunler', label: 'Ürünler', path: '/urunler', component: ProductListPage },
  { key: 'satis', label: 'Satış', path: '/satis', component: SalesInvoiceListPage },
  { key: 'tahsilat', label: 'Tahsilat', path: '/tahsilat', component: CollectionEntryPage },
  { key: 'alis', label: 'Alış', path: '/alis', component: PurchaseInvoicePage },
  { key: 'gider', label: 'Gider', path: '/gider', component: ExpenseListPage },
  { key: 'kasa-banka', label: 'Kasa/Banka', path: '/kasa-banka', component: CashBankPage },
  { key: 'stok', label: 'Stok', path: '/stok', component: StockOverviewPage },
  { key: 'raporlar', label: 'Raporlar', path: '/raporlar', component: ReportsPage },
  { key: 'gun-sonu', label: 'Gün Sonu', path: '/gun-sonu', component: EndOfDayPage },
  { key: 'ayarlar', label: 'Ayarlar', path: '/ayarlar', component: SettingsPage },
]

export function findRoute(pathname: string): AppRoute {
  return APP_ROUTES.find((route) => route.path === pathname) ?? APP_ROUTES[0]
}
