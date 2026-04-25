import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { AppShell } from "./AppShell";
import { appRoutes, getPersonnelRouteMatch, normalizePathname, type AppRoute } from "./routes";
import { navigateTo, useAppRoute } from "./useAppRoute";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { TaskPage } from "../pages/operations/TaskPage";
import { TeamPage } from "../pages/operations/TeamPage";
import { FieldReportPage } from "../pages/operations/FieldReportPage";
import { ZimmetPage } from "../pages/operations/ZimmetPage";
import { AttendancePage } from "../pages/operations/AttendancePage";
import { ShiftPlanningPage } from "../pages/operations/ShiftPlanningPage";
import { StockPage } from "../pages/operations/StockPage";
import { LeaveTrackingPage } from "../pages/operations/LeaveTrackingPage";
import { OvertimePage } from "../pages/operations/OvertimePage";
import { OvertimeApprovalPage } from "../pages/operations/OvertimeApprovalPage";
import { PurchaseInvoicePage } from "../pages/operations/PurchaseInvoicePage";
import { AttendanceTimeEntryPage } from "../pages/operations/AttendanceTimeEntryPage";
import { PersonnelListPage } from "../pages/personnel/PersonnelListPage";
import { PersonnelDetailPage } from "../pages/personnel/PersonnelDetailPage";
import { PersonnelCreatePage } from "../pages/personnel/PersonnelCreatePage";
import { PersonnelEditPage } from "../pages/personnel/PersonnelEditPage";
import { HrSetupCenterPage } from "../pages/hr/HrSetupCenterPage";
import { StockCreatePage } from "../pages/stock/StockCreatePage";
import { ZimmetCreatePage } from "../pages/zimmet/ZimmetCreatePage";
import { LeaveCreatePageWrapper } from "../pages/leave/LeaveCreatePage";
import { SalaryPageWrapper } from "../pages/salary/SalaryPage";
import { PayrollPageWrapper } from "../pages/salary/PayrollPage";
import { UserAccessPageWrapper } from "../pages/admin/UserAccessPage";
import { SettingsPageWrapper } from "../pages/admin/SettingsPage";
import { useRouteAccess } from "../features/platform/hooks/useRouteAccess";
import { useAuthSession } from "../features/auth/hooks/useAuthSession";
import { LoginScreen } from "../features/auth/components/LoginScreen";
import { requestErpJson } from "../lib/erpApi";

type RouteEntry = AppRoute & {
  element: ReactElement;
};

const routeEntries: RouteEntry[] = [
  { ...appRoutes[0], element: <DashboardPage /> },
  { ...appRoutes[1], element: <TaskPage /> },
  { ...appRoutes[2], element: <TeamPage /> },
  { ...appRoutes[3], element: <FieldReportPage /> },
  { ...appRoutes[4], element: <ZimmetPage /> },
  { ...appRoutes[5], element: <AttendancePage /> },
  { ...appRoutes[6], element: <ShiftPlanningPage /> },
  { ...appRoutes[7], element: <StockPage /> },
  { ...appRoutes[8], element: <LeaveTrackingPage /> },
  { ...appRoutes[9], element: <OvertimePage /> },
  { ...appRoutes[10], element: <OvertimeApprovalPage /> },
  { ...appRoutes[11], element: <PurchaseInvoicePage /> },
  { ...appRoutes[12], element: <PersonnelListPage /> },
  { ...appRoutes[13], element: <HrSetupCenterPage /> },
  { ...appRoutes[14], element: <SalaryPageWrapper /> },
  { ...appRoutes[15], element: <PayrollPageWrapper /> },
  { ...appRoutes[16], element: <AttendanceTimeEntryPage /> },
  { ...appRoutes[17], element: <UserAccessPageWrapper /> },
  { ...appRoutes[18], element: <SettingsPageWrapper /> }
];

type SessionActorContext = {
  roles?: string[];
};

export function App() {
  const currentPath = useAppRoute();
  const { isLoading, isSubmitting, isAuthenticated, errorMessage, login, logout } = useAuthSession();
  const [isSystemManager, setIsSystemManager] = useState(false);
  const { visibleRoutes, isRouteEnabled } = useRouteAccess(appRoutes, isAuthenticated);
  const personnelRouteMatch = getPersonnelRouteMatch(currentPath);

  function canAccessRoute(route: AppRoute) {
    if (!isRouteEnabled(route)) {
      return false;
    }

    if (route.path === "/kullanici-yetki") {
      return isSystemManager;
    }

    if (route.path === "/ayarlar") {
      return true;
    }

    return !route.adminOnly || isSystemManager;
  }

  const filteredRouteEntries = routeEntries.filter((route) => canAccessRoute(route));
  const filteredVisibleRoutes = visibleRoutes.filter((route) => canAccessRoute(route));
  const normalizedPath = normalizePathname(currentPath);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsSystemManager(false);
      return;
    }

    let cancelled = false;

    async function loadSessionActor() {
      try {
        const payload = await requestErpJson<{ message?: SessionActorContext }>(
          "/method/shipyard_app.platform.api.get_session_actor_context"
        );
        const roles = payload.message?.roles ?? [];
        if (!cancelled) {
          setIsSystemManager(roles.includes("System Manager"));
        }
      } catch {
        if (!cancelled) {
          setIsSystemManager(false);
        }
      }
    }

    void loadSessionActor();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (personnelRouteMatch) {
      return;
    }

    const isCreatePage = 
      normalizedPath === "/stok/yeni" ||
      normalizedPath === "/zimmet/yeni" ||
      normalizedPath === "/personel/yeni" ||
      normalizedPath === "/izinler/yeni";

    if (isCreatePage) {
      return;
    }

    if (!filteredRouteEntries.some((route) => route.path === currentPath)) {
      navigateTo(filteredRouteEntries[0]?.path ?? "/");
    }
  }, [currentPath, filteredRouteEntries, personnelRouteMatch, normalizedPath]);

  if (isLoading) {
    return (
      <div className="auth-screen auth-screen--loading">
        <p>Oturum kontrol ediliyor...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen errorMessage={errorMessage} isSubmitting={isSubmitting} onLogin={login} />;
  }

  if (personnelRouteMatch?.route === "/personel/yeni") {
    return (
      <AppShell currentPath={currentPath} onLogout={logout} routes={filteredVisibleRoutes}>
        <PersonnelCreatePage />
      </AppShell>
    );
  }

  if (personnelRouteMatch?.route === "/personel/:employeeId/duzenle" && personnelRouteMatch.employeeId) {
    return (
      <AppShell currentPath={currentPath} onLogout={logout} routes={filteredVisibleRoutes}>
        <PersonnelEditPage employeeId={personnelRouteMatch.employeeId} />
      </AppShell>
    );
  }

  if (personnelRouteMatch?.route === "/personel/:employeeId" && personnelRouteMatch.employeeId) {
    return (
      <AppShell currentPath={currentPath} onLogout={logout} routes={filteredVisibleRoutes}>
        <PersonnelDetailPage employeeId={personnelRouteMatch.employeeId} />
      </AppShell>
    );
  }

  if (normalizedPath === "/stok/yeni") {
    return (
      <AppShell currentPath={currentPath} onLogout={logout} routes={filteredVisibleRoutes}>
        <StockCreatePage />
      </AppShell>
    );
  }

  if (normalizedPath === "/zimmet/yeni") {
    return (
      <AppShell currentPath={currentPath} onLogout={logout} routes={filteredVisibleRoutes}>
        <ZimmetCreatePage />
      </AppShell>
    );
  }

  if (normalizedPath === "/izinler/yeni") {
    return (
      <AppShell currentPath={currentPath} onLogout={logout} routes={filteredVisibleRoutes}>
        <LeaveCreatePageWrapper />
      </AppShell>
    );
  }

  const activeRoute =
    filteredRouteEntries.find((route) => route.path === currentPath) ??
    filteredRouteEntries[0] ??
    routeEntries[0];

  return (
    <AppShell currentPath={currentPath} onLogout={logout} routes={filteredVisibleRoutes}>
      {activeRoute.element}
    </AppShell>
  );
}
