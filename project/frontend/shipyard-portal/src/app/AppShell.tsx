import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  FileCheck2,
  LayoutDashboard,
  Menu,
  PackageSearch,
  ReceiptText,
  ShieldCheck,
  Users,
  X
} from "lucide-react";
import type { AppRoute } from "./routes";
import { tenantConfig } from "../config/tenant";
import { isActiveRoute } from "./routes";
import { navigateTo } from "./useAppRoute";

type AppShellProps = PropsWithChildren<{
  currentPath: string;
  routes: AppRoute[];
}>;

const routeIcons: Record<string, LucideIcon> = {
  "/": LayoutDashboard,
  "/gorevler": ClipboardList,
  "/ekipler": Users,
  "/saha-bildirimi": FileCheck2,
  "/zimmet": ShieldCheck,
  "/attendance": BriefcaseBusiness,
  "/stok": PackageSearch,
  "/izinler": Building2,
  "/alis-faturalari": ReceiptText,
  "/personel": Users
};

export function AppShell({ children, currentPath, routes }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const activeRoute = useMemo(
    () => routes.find((route) => isActiveRoute(currentPath, route.path)) ?? routes[0] ?? null,
    [currentPath, routes],
  );

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [currentPath]);

  return (
    <div
      className={`shell shell--app${isSidebarCollapsed ? " shell--collapsed" : ""}${isMobileSidebarOpen ? " shell--drawer-open" : ""}`}
    >
      {isMobileSidebarOpen ? (
        <button
          aria-label="Menuyu kapat"
          className="shell__backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
          type="button"
        />
      ) : null}

      <aside className="shell__sidebar" aria-label="Ana menu">
        <header className="shell__sidebar-header">
          <div className="shell__brand">
            <span className="shell__brand-logo" aria-hidden="true">
              TS
            </span>
            <div className="shell__brand-copy">
              <strong>{tenantConfig.productName}</strong>
              <span>Tersane paneli</span>
            </div>
          </div>
          <div className="shell__sidebar-actions">
            <button
              aria-label={isSidebarCollapsed ? "Menuyu genislet" : "Menuyu daralt"}
              className="shell__icon-button shell__icon-button--desktop"
              onClick={() => setIsSidebarCollapsed((value) => !value)}
              type="button"
            >
              <Menu size={16} aria-hidden="true" />
            </button>
            <button
              aria-label="Menuyu kapat"
              className="shell__icon-button shell__icon-button--mobile"
              onClick={() => setIsMobileSidebarOpen(false)}
              type="button"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </header>

        <nav className="shell__sidebar-nav" aria-label="Operasyon ekranlari">
          {routes.map((route) => {
            const Icon = routeIcons[route.path] ?? LayoutDashboard;

            return (
              <a
                className={`shell__sidebar-link${isActiveRoute(currentPath, route.path) ? " shell__sidebar-link--active" : ""}`}
                href={route.path}
                key={route.path}
                onClick={(event) => {
                  event.preventDefault();
                  navigateTo(route.path);
                }}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="shell__sidebar-link-copy">
                  <strong>{route.label}</strong>
                  <small>{route.description}</small>
                </span>
              </a>
            );
          })}
        </nav>

        <footer className="shell__sidebar-footer">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>{tenantConfig.tenantLabel}</strong>
            <p>{tenantConfig.supportLabel}</p>
          </div>
        </footer>
      </aside>

      <div className="shell__content">
        <header className="shell__content-header">
          <button
            aria-label="Menuyu ac"
            className="shell__icon-button shell__icon-button--mobile"
            onClick={() => setIsMobileSidebarOpen(true)}
            type="button"
          >
            <Menu size={16} aria-hidden="true" />
          </button>
          <div className="shell__content-copy">
            <p className="eyebrow">Operasyon dashboard</p>
            <h1>{activeRoute?.label ?? "Genel Bakis"}</h1>
            <p>{activeRoute?.description ?? "Operasyon ozeti"}</p>
          </div>
        </header>
        <main className={currentPath === "/" ? "shell__dashboard-root" : undefined}>{children}</main>
      </div>
    </div>
  );
}
