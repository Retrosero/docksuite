import type { PropsWithChildren } from "react";
import type { AppRoute } from "./routes";
import { tenantConfig } from "../config/tenant";
import { isActiveRoute } from "./routes";
import { navigateTo } from "./useAppRoute";

type AppShellProps = PropsWithChildren<{
  currentPath: string;
  routes: AppRoute[];
}>;

export function AppShell({ children, currentPath, routes }: AppShellProps) {
  const isDashboardHome = currentPath === "/";

  return (
    <div className={`shell${isDashboardHome ? " shell--dashboard" : ""}`}>
      {isDashboardHome ? null : (
        <header className="shell__header">
          <div>
            <p className="eyebrow">Tersane operasyon portali</p>
            <h1>{tenantConfig.productName}</h1>
          </div>
          <div className="shell__tenant-card">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <strong>{tenantConfig.tenantLabel}</strong>
              <p>{tenantConfig.supportLabel}</p>
            </div>
          </div>
        </header>
      )}
      {!isDashboardHome ? (
        <nav className="shell__nav" aria-label="Operasyon ekranlari">
          {routes.map((route) => (
            <a
              className={`shell__nav-link${isActiveRoute(currentPath, route.path) ? " shell__nav-link--active" : ""}`}
              href={route.path}
              key={route.path}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(route.path);
              }}
            >
              <strong>{route.label}</strong>
              <span>{route.description}</span>
            </a>
          ))}
        </nav>
      ) : null}
      <main className={isDashboardHome ? "shell__dashboard-root" : undefined}>{children}</main>
    </div>
  );
}
