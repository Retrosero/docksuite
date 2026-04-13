export type AppRoute = {
  path: string;
  label: string;
  description: string;
  access?: {
    domainKey?: string;
    capabilityKey?: string;
  };
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
    description: "Gorev listesi",
    access: { domainKey: "shipyard" }
  },
  {
    path: "/ekipler",
    label: "Ekipler",
    description: "Ekip listesi",
    access: { domainKey: "shipyard" }
  },
  {
    path: "/saha-bildirimi",
    label: "Saha Bildirimi",
    description: "Mobil bildirim formu",
    access: { domainKey: "shipyard" }
  },
  {
    path: "/zimmet",
    label: "Zimmet",
    description: "Teslim ve iade akisi",
    access: { domainKey: "shipyard", capabilityKey: "zimmet" }
  },
  {
    path: "/attendance",
    label: "Vardiya Takibi",
    description: "Bugunku vardiya ve attendance durumu",
    access: { domainKey: "shipyard", capabilityKey: "vardiya" }
  },
  {
    path: "/stok",
    label: "Stok",
    description: "Item stok kartlari",
    access: { domainKey: "shipyard", capabilityKey: "stok" }
  },
  {
    path: "/izinler",
    label: "Izin Takibi",
    description: "Leave Application ve Allocation ozeti",
    access: { domainKey: "shipyard" }
  },
  {
    path: "/alis-faturalari",
    label: "Alis Faturalari",
    description: "Purchase Invoice liste ve odeme durumu",
    access: { domainKey: "shipyard" }
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
  const createPath = "/personel/yeni";
  const detailPrefix = "/personel/";

  if (normalizedPath === "/personel") {
    return { route: "/personel" as const, employeeId: null };
  }

  if (normalizedPath === createPath) {
    return { route: "/personel/yeni" as const, employeeId: null };
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
