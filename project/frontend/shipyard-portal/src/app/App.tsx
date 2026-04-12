import type { ReactElement } from "react";
import { AppShell } from "./AppShell";
import { appRoutes, type AppRoute } from "./routes";
import { useAppRoute } from "./useAppRoute";
import { OperationsPage } from "../pages/operations/OperationsPage";
import { TaskPage } from "../pages/operations/TaskPage";
import { TeamPage } from "../pages/operations/TeamPage";
import { FieldReportPage } from "../pages/operations/FieldReportPage";
import { ZimmetPage } from "../pages/operations/ZimmetPage";
import { AttendancePage } from "../pages/operations/AttendancePage";

type RouteEntry = AppRoute & {
  element: ReactElement;
};

const routeEntries: RouteEntry[] = [
  { ...appRoutes[0], element: <OperationsPage /> },
  { ...appRoutes[1], element: <TaskPage /> },
  { ...appRoutes[2], element: <TeamPage /> },
  { ...appRoutes[3], element: <FieldReportPage /> },
  { ...appRoutes[4], element: <ZimmetPage /> },
  { ...appRoutes[5], element: <AttendancePage /> }
];

export function App() {
  const currentPath = useAppRoute();
  const activeRoute = routeEntries.find((route) => route.path === currentPath) ?? routeEntries[0];

  return (
    <AppShell currentPath={currentPath} routes={appRoutes}>
      {activeRoute.element}
    </AppShell>
  );
}
