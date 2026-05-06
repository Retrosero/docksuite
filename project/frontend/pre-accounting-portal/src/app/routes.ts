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
import { UserManagementPage } from '../pages/kullanicilar/UserManagementPage'
import { ApprovalQueuePage } from '../pages/onaylar/ApprovalQueuePage'
import { TenantManagementPage } from '../pages/yonetimpaneli/TenantManagementPage'
import { PeriodClosingPage } from '../pages/donem-kapanis/PeriodClosingPage'
import { EDocumentCenterPage } from '../pages/e-belge/eDocumentCenter/eDocumentCenterPage'

export type RoleTemplateKey = 'yonetici' | 'muhasebe_sorumlusu' | 'satis_operasyon' | 'depo_sorumlusu' | 'salt_okuma'
export type ScreenAccessMap = Record<string, boolean>
export type ScreenAccessMatrix = Record<RoleTemplateKey, ScreenAccessMap>

export type AppRoute = {
  key: string
  label: string
  path: string
  component: (props: RoutePageProps) => ReactElement
  allowedTemplates: RoleTemplateKey[] | 'all'
}

export const APP_ROUTES: AppRoute[] = [
  { key: 'dashboard', label: 'Genel Bakış', path: '/', component: DashboardPage, allowedTemplates: 'all' },
  { key: 'cari', label: 'Cari', path: '/cari', component: CariListPage, allowedTemplates: 'all' },
  { key: 'musteriler', label: 'Müşteriler', path: '/musteriler', component: CustomerListPage, allowedTemplates: 'all' },
  { key: 'urunler', label: 'Ürünler', path: '/urunler', component: ProductListPage, allowedTemplates: 'all' },
  { key: 'satis', label: 'Satış', path: '/satis', component: SalesInvoiceListPage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu', 'satis_operasyon', 'salt_okuma'] },
  { key: 'tahsilat', label: 'Tahsilat', path: '/tahsilat', component: CollectionEntryPage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu', 'satis_operasyon', 'salt_okuma'] },
  { key: 'alis', label: 'Alış', path: '/alis', component: PurchaseInvoicePage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu', 'salt_okuma'] },
  { key: 'gider', label: 'Gider', path: '/gider', component: ExpenseListPage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu', 'salt_okuma'] },
  { key: 'kasa-banka', label: 'Kasa/Banka', path: '/kasa-banka', component: CashBankPage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu'] },
  { key: 'stok', label: 'Stok', path: '/stok', component: StockOverviewPage, allowedTemplates: 'all' },
  { key: 'onaylar', label: 'Onaylar', path: '/onaylar', component: ApprovalQueuePage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu'] },
  { key: 'raporlar', label: 'Raporlar', path: '/raporlar', component: ReportsPage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu', 'salt_okuma'] },
  { key: 'kullanicilar', label: 'Kullanıcılar', path: '/kullanicilar', component: UserManagementPage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu'] },
  { key: 'gun-sonu', label: 'Gün Sonu', path: '/gun-sonu', component: EndOfDayPage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu'] },
  { key: 'donem-kapanis', label: 'Dönem Kapanış', path: '/donem-kapanis', component: PeriodClosingPage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu'] },
  { key: 'e-belge', label: 'E-Belge', path: '/e-belge', component: EDocumentCenterPage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu'] },
  { key: 'tenant-yonetimi', label: 'Tenant Yönetimi', path: '/tenant-yonetimi', component: TenantManagementPage, allowedTemplates: ['yonetici'] },
  { key: 'ayarlar', label: 'Ayarlar', path: '/ayarlar', component: SettingsPage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu'] },
]

export function isRouteAccessible(route: AppRoute, userRoleTemplate: RoleTemplateKey | null): boolean {
  if (route.allowedTemplates === 'all') return true
  if (!userRoleTemplate) return false
  return route.allowedTemplates.includes(userRoleTemplate)
}

export function filterAccessibleRoutes(routes: AppRoute[], userRoleTemplate: RoleTemplateKey | null): AppRoute[] {
  return routes.filter((route) => isRouteAccessible(route, userRoleTemplate))
}

export function filterAccessibleRoutesWithMatrix(
  routes: AppRoute[],
  userRoleTemplate: RoleTemplateKey | null,
  matrix: ScreenAccessMatrix | null,
): AppRoute[] {
  const roleFiltered = filterAccessibleRoutes(routes, userRoleTemplate)
  if (!userRoleTemplate || !matrix) return roleFiltered
  const roleAccess = matrix[userRoleTemplate]
  if (!roleAccess) return roleFiltered
  return roleFiltered.filter((route) => roleAccess[route.key] !== false)
}

export function findRoute(pathname: string): AppRoute {
  return APP_ROUTES.find((route) => route.path === pathname) ?? APP_ROUTES[0]
}
