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
  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <p className="eyebrow">{appTitle}</p>
          <h1>{activeLabel}</h1>
        </div>
      </header>
      <nav className="main-nav" aria-label="Ana menu">
        {APP_ROUTES.map((route) => (
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
