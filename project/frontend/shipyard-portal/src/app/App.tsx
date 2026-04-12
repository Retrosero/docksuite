import type { ReactElement } from "react";
import { AppShell } from "./AppShell";
import { appRoutes, getPersonnelRouteMatch, type AppRoute } from "./routes";
import { useAppRoute } from "./useAppRoute";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { TaskPage } from "../pages/operations/TaskPage";
import { TeamPage } from "../pages/operations/TeamPage";
import { FieldReportPage } from "../pages/operations/FieldReportPage";
import { ZimmetPage } from "../pages/operations/ZimmetPage";
import { AttendancePage } from "../pages/operations/AttendancePage";
import { PersonnelListPage } from "../pages/personnel/PersonnelListPage";
import { PersonnelDetailPage } from "../pages/personnel/PersonnelDetailPage";
import { PersonnelCreatePage } from "../pages/personnel/PersonnelCreatePage";

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
  { ...appRoutes[6], element: <PersonnelListPage /> }
];

export function App() {
  const currentPath = useAppRoute();
  const personnelRouteMatch = getPersonnelRouteMatch(currentPath);

  if (personnelRouteMatch?.route === "/personel/yeni") {
    return (
      <AppShell currentPath={currentPath} routes={appRoutes}>
        <PersonnelCreatePage />
      </AppShell>
    );
  }

  if (personnelRouteMatch?.route === "/personel/:employeeId" && personnelRouteMatch.employeeId) {
    return (
      <AppShell currentPath={currentPath} routes={appRoutes}>
        <PersonnelDetailPage employeeId={personnelRouteMatch.employeeId} />
      </AppShell>
    );
  }

  const activeRoute = routeEntries.find((route) => route.path === currentPath) ?? routeEntries[0];

  return (
    <AppShell currentPath={currentPath} routes={appRoutes}>
      {activeRoute.element}
    </AppShell>
  );
}
