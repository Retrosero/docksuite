import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  ShoppingCart,
  Banknote,
  Truck,
  Wallet,
  Receipt,
  CreditCard,
  Warehouse,
  CheckCircle,
  BarChart3,
  UserCog,
  Sun,
  Lock,
  FileText,
  ArrowLeftRight,
  Settings,
  Rocket,
  Search,
  Bell,
  HelpCircle,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { APP_ROUTES, filterAccessibleRoutesWithMatrix, type RoleTemplateKey, type ScreenAccessMatrix } from './routes'

type AppShellProps = {
  appTitle: string
  activePath: string
  activeLabel: string
  userRoleTemplate: RoleTemplateKey | null
  screenAccessMatrix: ScreenAccessMatrix
  onNavigate: (path: string) => void
  children: ReactNode
}

// Lucide icon mapping for each route
const NAV_ICONS: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  cari: Users,
  musteriler: Building2,
  'musteri-detay': Users,
  urunler: Package,
  satis: ShoppingCart,
  tahsilat: Banknote,
  alis: Truck,
  gider: Receipt,
  'kasa-banka': Wallet,
  'cek-senet': CreditCard,
  stok: Warehouse,
  onaylar: CheckCircle,
  raporlar: BarChart3,
  'nakit-akisi': TrendingUp,
  'vade-analizi': TrendingDown,
  kullanicilar: UserCog,
  'gun-sonu': Sun,
  'donem-kapanis': Lock,
  'e-belge': FileText,
  aktarim: ArrowLeftRight,
  'tenant-yonetimi': Settings,
  ayarlar: Settings,
  onboarding: Rocket,
}

// Group routes by category
const ROUTE_GROUPS = [
  { title: 'Ana Menü', keys: ['dashboard', 'cari', 'musteriler', 'urunler', 'satis', 'tahsilat', 'alis', 'gider'] },
  { title: 'Finans', keys: ['kasa-banka', 'cek-senet', 'aktarim'] },
  { title: 'Raporlar', keys: ['raporlar', 'nakit-akisi', 'vade-analizi'] },
  { title: 'Operasyon', keys: ['stok', 'onaylar', 'gun-sonu', 'donem-kapanis'] },
  { title: 'Yönetim', keys: ['kullanicilar', 'e-belge', 'ayarlar'] },
]

export function AppShell({ appTitle, activePath, activeLabel, userRoleTemplate, screenAccessMatrix, onNavigate, children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const accessibleRoutes = filterAccessibleRoutesWithMatrix(APP_ROUTES, userRoleTemplate, screenAccessMatrix).filter(
    (route) => route.key !== 'musteri-detay',
  )

  // Build grouped navigation
  const groupedNav = ROUTE_GROUPS.map(group => ({
    title: group.title,
    routes: accessibleRoutes.filter(route => group.keys.includes(route.key)),
  })).filter(group => group.routes.length > 0)

  const handleNavClick = (path: string) => {
    onNavigate(path)
    setIsSidebarOpen(false)
  }

  const getIcon = (key: string) => {
    const IconComponent = NAV_ICONS[key]
    return IconComponent ? <IconComponent size={20} /> : <Package size={20} />
  }

  const activeRoute = accessibleRoutes.find(r => r.path === activePath)
  const ActiveIcon = activeRoute ? NAV_ICONS[activeRoute.key] : LayoutDashboard

  return (
    <div className="app-layout">
      {/* Sidebar Toggle Button (Mobile) */}
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Menüyü aç/kapat"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">D</div>
          <div className="sidebar-brand">
            <span>DockSuite</span>
            <small>Ön Muhasebe</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {groupedNav.map((group) => (
            <div key={group.title} className="sidebar-section">
              <div className="sidebar-section-title">{group.title}</div>
              <ul className="sidebar-menu">
                {group.routes.map((route) => {
                  const Icon = NAV_ICONS[route.key] || Package
                  return (
                    <li key={route.key} className="sidebar-item">
                      <button
                        type="button"
                        className={`sidebar-link ${route.path === activePath ? 'active' : ''}`}
                        onClick={() => handleNavClick(route.path)}
                      >
                        <span className="sidebar-icon"><Icon size={20} /></span>
                        <span className="sidebar-text">{route.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {userRoleTemplate ? userRoleTemplate.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <strong>{userRoleTemplate || 'Kullanıcı'}</strong>
              <span>Çevrimiçi</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <div className="main-wrapper">
        <header className="header">
          <div className="header-left">
            <div className="header-search">
              <span className="header-search-icon"><Search size={18} /></span>
              <input type="search" placeholder="Cari, fatura veya ürün ara..." />
            </div>
          </div>
          <div className="header-right">
            <button type="button" className="header-icon-btn" title="Bildirimler">
              <Bell size={20} />
              <span className="badge"></span>
            </button>
            <button type="button" className="header-icon-btn" title="Yardım">
              <HelpCircle size={20} />
            </button>
            <div className="header-divider"></div>
            <button type="button" className="header-icon-btn" title="Ayarlar">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <main className="page-container">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-top">
              <div className="page-title-group">
                <h1 className="page-title">
                  <ActiveIcon size={28} /> {activeLabel}
                </h1>
                <p className="page-subtitle">{appTitle}</p>
              </div>
              <div className="page-actions">
                <button type="button" className="btn btn-secondary btn-sm">
                  <BarChart3 size={16} /> Dışa Aktar
                </button>
                <button type="button" className="btn btn-primary btn-sm">
                  <Package size={16} /> Yeni Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="mobile-nav">
          <ul className="mobile-nav-list">
            {accessibleRoutes.slice(0, 5).map((route) => {
              const Icon = NAV_ICONS[route.key] || Package
              return (
                <li key={route.key}>
                  <button
                    type="button"
                    className={`mobile-nav-item ${route.path === activePath ? 'active' : ''}`}
                    onClick={() => handleNavClick(route.path)}
                  >
                    <span className="mobile-nav-icon"><Icon size={22} /></span>
                    <span className="mobile-nav-label">{route.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}