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
  }
];

export function normalizePathname(pathname: string) {
  return pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
}

export function isActiveRoute(currentPath: string, routePath: string) {
  return normalizePathname(currentPath) === normalizePathname(routePath);
}
