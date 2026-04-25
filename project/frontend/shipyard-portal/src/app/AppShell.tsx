import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ClipboardList,
  FileCheck2,
  LayoutDashboard,
  Menu,
  PackageSearch,
  ReceiptText,
  ShieldCheck,
  User,
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
  onLogout?: () => void;
}>;

type MenuGroupDefinition = {
  key: string;
  label: string;
  icon: LucideIcon;
  paths: string[];
};

const routeIcons: Record<string, LucideIcon> = {
  "/": LayoutDashboard,
  "/gorevler": ClipboardList,
  "/ekipler": Users,
  "/saha-bildirimi": FileCheck2,
  "/zimmet": ShieldCheck,
  "/attendance": BriefcaseBusiness,
  "/vardiya-plan": BriefcaseBusiness,
  "/mesai": BriefcaseBusiness,
  "/mesai-onay": BriefcaseBusiness,
  "/stok": PackageSearch,
  "/izinler": Building2,
  "/alis-faturalari": ReceiptText,
  "/maas": ReceiptText,
  "/maas-hesapla": ReceiptText,
  "/personel": Users,
  "/ik-kurulum": Building2,
  "/aday-takip": BriefcaseBusiness,
  "/ise-giris-sureci": BriefcaseBusiness,
  "/isten-cikis-sureci": BriefcaseBusiness,
  "/egitim-sertifika": BriefcaseBusiness,
  "/yetkinlik-matrisi": BriefcaseBusiness,
  "/kullanici-yetki": ShieldCheck,
  "/ayarlar": Building2
};

const menuGroupDefinitions: MenuGroupDefinition[] = [
  {
    key: "genel",
    label: "Genel",
    icon: LayoutDashboard,
    paths: ["/"]
  },
  {
    key: "operasyon",
    label: "Operasyon",
    icon: ClipboardList,
    paths: ["/gorevler", "/ekipler", "/saha-bildirimi", "/zimmet", "/attendance", "/vardiya-plan", "/stok"]
  },
  {
    key: "izin-mesai",
    label: "Izin ve Mesai",
    icon: Building2,
    paths: ["/izinler", "/mesai", "/mesai-onay"]
  },
  {
    key: "finans",
    label: "Finans",
    icon: ReceiptText,
    paths: ["/alis-faturalari", "/maas", "/maas-hesapla"]
  },
  {
    key: "yonetim",
    label: "Yonetim",
    icon: ShieldCheck,
    paths: ["/personel", "/ik-kurulum", "/aday-takip", "/ise-giris-sureci", "/isten-cikis-sureci", "/egitim-sertifika", "/yetkinlik-matrisi", "/ayarlar", "/kullanici-yetki"]
  }
];

export function AppShell({ children, currentPath, routes, onLogout }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<string[]>(["genel", "operasyon"]);

  const activeRoute = useMemo(
    () => routes.find((route) => isActiveRoute(currentPath, route.path)) ?? routes[0] ?? null,
    [currentPath, routes],
  );

  const groupedRoutes = useMemo(() => {
    const routeMap = new Map(routes.map((route) => [route.path, route] as const));

    const definedGroups = menuGroupDefinitions
      .map((group) => ({
        key: group.key,
        label: group.label,
        icon: group.icon,
        routes: group.paths.map((path) => routeMap.get(path)).filter(Boolean) as AppRoute[]
      }))
      .filter((group) => group.routes.length > 0);

    const assignedPaths = new Set(definedGroups.flatMap((group) => group.routes.map((route) => route.path)));
    const ungroupedRoutes = routes.filter((route) => !assignedPaths.has(route.path));

    if (ungroupedRoutes.length > 0) {
      definedGroups.push({
        key: "diger",
        label: "Diger",
        icon: LayoutDashboard,
        routes: ungroupedRoutes
      });
    }

    return definedGroups;
  }, [routes]);

  const activeGroupKey = useMemo(
    () =>
      groupedRoutes.find((group) => group.routes.some((route) => isActiveRoute(currentPath, route.path)))?.key ??
      groupedRoutes[0]?.key ??
      null,
    [currentPath, groupedRoutes]
  );

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!activeGroupKey) {
      return;
    }

    setExpandedGroupKeys((previous) =>
      previous.includes(activeGroupKey) ? previous : [...previous, activeGroupKey]
    );
  }, [activeGroupKey]);

  function toggleGroup(groupKey: string) {
    setExpandedGroupKeys((previous) =>
      previous.includes(groupKey) ? previous.filter((value) => value !== groupKey) : [...previous, groupKey]
    );
  }

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
          {isSidebarCollapsed ? (
            <div className="shell__sidebar-compact-nav">
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
                    title={route.label}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span className="shell__sidebar-link-copy">
                      <strong>{route.label}</strong>
                    </span>
                  </a>
                );
              })}
            </div>
          ) : (
            groupedRoutes.map((group) => {
              const GroupIcon = group.icon;
              const isGroupExpanded = expandedGroupKeys.includes(group.key);
              const isGroupActive = group.key === activeGroupKey;

              return (
                <section className="shell__sidebar-group" key={group.key}>
                  <button
                    aria-expanded={isGroupExpanded}
                    className={`shell__sidebar-group-trigger${isGroupActive ? " shell__sidebar-group-trigger--active" : ""}`}
                    onClick={() => toggleGroup(group.key)}
                    type="button"
                  >
                    <GroupIcon size={17} aria-hidden="true" />
                    <span className="shell__sidebar-group-copy">{group.label}</span>
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className={`shell__sidebar-group-chevron${isGroupExpanded ? " shell__sidebar-group-chevron--open" : ""}`}
                    />
                  </button>

                  {isGroupExpanded ? (
                    <div className="shell__sidebar-submenu">
                      {group.routes.map((route) => {
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
                            <Icon size={16} aria-hidden="true" />
                            <span className="shell__sidebar-link-copy">
                              <strong>{route.label}</strong>
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </section>
              );
            })
          )}
        </nav>

      </aside>

      <div className="shell__content">
        <header className="shell__topbar">
          <button
            aria-label="Menuyu ac"
            className="shell__icon-button shell__icon-button--mobile"
            onClick={() => setIsMobileSidebarOpen(true)}
            type="button"
          >
            <Menu size={16} aria-hidden="true" />
          </button>

          <div className="shell__topbar-title">
            <h1>{activeRoute?.label ?? "Genel Bakis"}</h1>
          </div>

          <div className="shell__topbar-actions">
            <button className="shell__icon-button" aria-label="Bildirimler" type="button">
              <Bell size={18} />
            </button>
            <button className="shell__icon-button" aria-label="Profil" type="button">
              <User size={18} />
            </button>
            {onLogout ? (
              <button className="shell__topbar-logout" onClick={onLogout} type="button">
                Cikis
              </button>
            ) : null}
          </div>
        </header>

        <main className={currentPath === "/" ? "shell__dashboard-root" : undefined}>{children}</main>
      </div>
    </div>
  );
}
