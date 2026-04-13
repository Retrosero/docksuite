import { useEffect } from "react";
import type { ReactElement } from "react";
import { AppShell } from "./AppShell";
import { appRoutes, getPersonnelRouteMatch, type AppRoute } from "./routes";
import { navigateTo, useAppRoute } from "./useAppRoute";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { TaskPage } from "../pages/operations/TaskPage";
import { TeamPage } from "../pages/operations/TeamPage";
import { FieldReportPage } from "../pages/operations/FieldReportPage";
import { ZimmetPage } from "../pages/operations/ZimmetPage";
import { AttendancePage } from "../pages/operations/AttendancePage";
import { StockPage } from "../pages/operations/StockPage";
import { LeaveTrackingPage } from "../pages/operations/LeaveTrackingPage";
import { PurchaseInvoicePage } from "../pages/operations/PurchaseInvoicePage";
import { PersonnelListPage } from "../pages/personnel/PersonnelListPage";
import { PersonnelDetailPage } from "../pages/personnel/PersonnelDetailPage";
import { PersonnelCreatePage } from "../pages/personnel/PersonnelCreatePage";
import { useRouteAccess } from "../features/platform/hooks/useRouteAccess";

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
  { ...appRoutes[6], element: <StockPage /> },
  { ...appRoutes[7], element: <LeaveTrackingPage /> },
  { ...appRoutes[8], element: <PurchaseInvoicePage /> },
  { ...appRoutes[9], element: <PersonnelListPage /> }
];

export function App() {
  const currentPath = useAppRoute();
  const { visibleRoutes, isRouteEnabled } = useRouteAccess(appRoutes);
  const personnelRouteMatch = getPersonnelRouteMatch(currentPath);
  const filteredRouteEntries = routeEntries.filter((route) => isRouteEnabled(route));

  useEffect(() => {
    if (personnelRouteMatch) {
      return;
    }
    if (!filteredRouteEntries.some((route) => route.path === currentPath)) {
      navigateTo(filteredRouteEntries[0]?.path ?? "/");
    }
  }, [currentPath, filteredRouteEntries, personnelRouteMatch]);

  if (personnelRouteMatch?.route === "/personel/yeni") {
    return (
      <AppShell currentPath={currentPath} routes={visibleRoutes}>
        <PersonnelCreatePage />
      </AppShell>
    );
  }

  if (personnelRouteMatch?.route === "/personel/:employeeId" && personnelRouteMatch.employeeId) {
    return (
      <AppShell currentPath={currentPath} routes={visibleRoutes}>
        <PersonnelDetailPage employeeId={personnelRouteMatch.employeeId} />
      </AppShell>
    );
  }

  const activeRoute =
    filteredRouteEntries.find((route) => route.path === currentPath) ??
    filteredRouteEntries[0] ??
    routeEntries[0];

  return (
    <AppShell currentPath={currentPath} routes={visibleRoutes}>
      {activeRoute.element}
    </AppShell>
  );
}
