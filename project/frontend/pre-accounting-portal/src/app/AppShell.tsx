import type { ReactNode } from 'react'
import { APP_ROUTES, filterAccessibleRoutes, type RoleTemplateKey } from './routes'

type AppShellProps = {
  appTitle: string
  activePath: string
  activeLabel: string
  userRoleTemplate: RoleTemplateKey | null
  onNavigate: (path: string) => void
  children: ReactNode
}

export function AppShell({ appTitle, activePath, activeLabel, userRoleTemplate, onNavigate, children }: AppShellProps) {
  const accessibleRoutes = filterAccessibleRoutes(APP_ROUTES, userRoleTemplate)
  const primaryRoutes = accessibleRoutes.slice(0, 8)
  const secondaryRoutes = accessibleRoutes.slice(8)

  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <p className="eyebrow">{appTitle}</p>
          <h1>{activeLabel}</h1>
        </div>
        <span className="topbar-badge">Mobil ERP</span>
      </header>
      <nav className="main-nav" aria-label="Ana menü">
        {primaryRoutes.map((route) => (
          <button
            key={route.key}
            type="button"
            className={route.path === activePath ? 'nav-item active' : 'nav-item'}
            onClick={() => onNavigate(route.path)}
          >
            {route.label}
          </button>
        ))}
      </nav>
      <nav className="secondary-nav" aria-label="Diğer sayfalar">
        {secondaryRoutes.map((route) => (
          <button
            key={route.key}
            type="button"
            className={route.path === activePath ? 'nav-item active' : 'nav-item'}
            onClick={() => onNavigate(route.path)}
          >
            {route.label}
          </button>
        ))}
      </nav>
      <main className="content">{children}</main>
    </div>
  )
}
