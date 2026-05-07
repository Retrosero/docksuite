import type { ReactNode } from 'react'
import { useState } from 'react'
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

// Navigation icons (using Unicode symbols)
const NAV_ICONS: Record<string, string> = {
  dashboard: '📊',
  cari: '👥',
  musteriler: '🏢',
  'musteri-detay': '📋',
  urunler: '📦',
  satis: '💰',
  tahsilat: '💵',
  alis: '🛒',
  gider: '📄',
  'kasa-banka': '🏦',
  'cek-senet': '📜',
  stok: '📈',
  onaylar: '✅',
  raporlar: '📊',
  kullanicilar: '👤',
  'gun-sonu': '🌙',
  'donem-kapanis': '🔒',
  'e-belge': '📨',
  aktarim: '🔄',
  'tenant-yonetimi': '⚙️',
  ayarlar: '⚙️',
  onboarding: '🚀',
}

// Group routes by category
const ROUTE_GROUPS = [
  { title: 'Ana Menü', keys: ['dashboard', 'cari', 'musteriler', 'urunler', 'satis', 'tahsilat', 'alis', 'gider'] },
  { title: 'Finans', keys: ['kasa-banka', 'cek-senet', 'aktarim'] },
  { title: 'Operasyon', keys: ['stok', 'onaylar', 'gun-sonu', 'donem-kapanis'] },
  { title: 'Yönetim', keys: ['raporlar', 'kullanicilar', 'e-belge', 'ayarlar'] },
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

  const getIcon = (key: string) => NAV_ICONS[key] || '📁'

  return (
    <div className="app-layout">
      {/* Sidebar Toggle Button (Mobile) */}
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Menüyü aç/kapat"
      >
        {isSidebarOpen ? '✕' : '☰'}
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
                {group.routes.map((route) => (
                  <li key={route.key} className="sidebar-item">
                    <button
                      type="button"
                      className={`sidebar-link ${route.path === activePath ? 'active' : ''}`}
                      onClick={() => handleNavClick(route.path)}
                    >
                      <span className="sidebar-icon">{getIcon(route.key)}</span>
                      <span className="sidebar-text">{route.label}</span>
                    </button>
                  </li>
                ))}
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
              <span className="header-search-icon">🔍</span>
              <input type="search" placeholder="Cari, fatura veya ürün ara..." />
            </div>
          </div>
          <div className="header-right">
            <button type="button" className="header-icon-btn" title="Bildirimler">
              🔔
              <span className="badge"></span>
            </button>
            <button type="button" className="header-icon-btn" title="Yardım">
              ❓
            </button>
            <div className="header-divider"></div>
            <button type="button" className="header-icon-btn" title="Ayarlar">
              ⚙️
            </button>
          </div>
        </header>

        <main className="page-container">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-top">
              <div className="page-title-group">
                <h1 className="page-title">
                  {getIcon(accessibleRoutes.find(r => r.path === activePath)?.key || '')} {activeLabel}
                </h1>
                <p className="page-subtitle">{appTitle}</p>
              </div>
              <div className="page-actions">
                <button type="button" className="btn btn-secondary btn-sm">
                  📥 Dışa Aktar
                </button>
                <button type="button" className="btn btn-primary btn-sm">
                  ➕ Yeni Ekle
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
            {accessibleRoutes.slice(0, 5).map((route) => (
              <li key={route.key}>
                <button
                  type="button"
                  className={`mobile-nav-item ${route.path === activePath ? 'active' : ''}`}
                  onClick={() => handleNavClick(route.path)}
                >
                  <span className="mobile-nav-icon">{getIcon(route.key)}</span>
                  <span className="mobile-nav-label">{route.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}