import type { ReactNode } from 'react'
import { APP_ROUTES } from './routes'

type AppShellProps = {
  appTitle: string
  activePath: string
  activeLabel: string
  onNavigate: (path: string) => void
  children: ReactNode
}

export function AppShell({ appTitle, activePath, activeLabel, onNavigate, children }: AppShellProps) {
  const primaryRoutes = APP_ROUTES.slice(0, 8)
  const secondaryRoutes = APP_ROUTES.slice(8)

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
