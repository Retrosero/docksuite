export type AppRoute = {
  path: string;
  label: string;
  description: string;
};

export const appRoutes: AppRoute[] = [
  {
    path: "/",
    label: "Genel Bakis",
    description: "Operasyon merkez ozeti"
  },
  {
    path: "/gorevler",
    label: "Gorevler",
    description: "Gorev listesi"
  },
  {
    path: "/ekipler",
    label: "Ekipler",
    description: "Ekip listesi"
  },
  {
    path: "/saha-bildirimi",
    label: "Saha Bildirimi",
    description: "Mobil bildirim formu"
  },
  {
    path: "/zimmet",
    label: "Zimmet",
    description: "Teslim ve iade akisi"
  },
  {
    path: "/attendance",
    label: "Attendance",
    description: "Giris-cikis ekrani"
  },
  {
    path: "/personel",
    label: "Personel",
    description: "Personel listesi"
  }
];

export function normalizePathname(pathname: string) {
  return pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
}

export function isActiveRoute(currentPath: string, routePath: string) {
  const normalizedCurrent = normalizePathname(currentPath);
  const normalizedRoute = normalizePathname(routePath);

  if (normalizedRoute === "/") {
    return normalizedCurrent === "/";
  }

  return normalizedCurrent === normalizedRoute || normalizedCurrent.startsWith(`${normalizedRoute}/`);
}

export function getPersonnelRouteMatch(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  const detailPrefix = "/personel/";

  if (normalizedPath === "/personel") {
    return { route: "/personel" as const, employeeId: null };
  }

  if (normalizedPath.startsWith(detailPrefix)) {
    const encodedId = normalizedPath.slice(detailPrefix.length);
    const employeeId = decodeURIComponent(encodedId);

    if (employeeId.length > 0) {
      return { route: "/personel/:employeeId" as const, employeeId };
    }
  }

  return null;
}
