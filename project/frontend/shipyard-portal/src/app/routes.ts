export type AppRoute = {
  path: string;
  label: string;
  description: string;
  adminOnly?: boolean;
  access?: {
    domainKey?: string;
    capabilityKey?: string;
  };
};

export const appRoutes: AppRoute[] = [
  {
    path: "/",
    label: "Genel Bakis",
    description: "Operasyon merkez ozeti",
  },
  {
    path: "/gorevler",
    label: "Gorevler",
    description: "Gorev listesi",
    access: { domainKey: "shipyard" },
  },
  {
    path: "/ekipler",
    label: "Ekipler",
    description: "Ekip listesi",
    access: { domainKey: "shipyard" },
  },
  {
    path: "/saha-bildirimi",
    label: "Saha Bildirimi",
    description: "Mobil bildirim formu",
    access: { domainKey: "shipyard" },
  },
  {
    path: "/zimmet",
    label: "Zimmet",
    description: "Teslim ve iade akisi",
    access: { domainKey: "shipyard", capabilityKey: "zimmet" },
  },
  {
    path: "/attendance",
    label: "Vardiya Takibi",
    description: "Bugunku vardiya ve attendance durumu",
    access: { domainKey: "shipyard", capabilityKey: "vardiya" },
  },
  {
    path: "/vardiya-plan",
    label: "Vardiya Plani",
    description: "Vardiya atama ve planlama",
    access: { domainKey: "shipyard", capabilityKey: "vardiya" },
  },
  {
    path: "/stok",
    label: "Stok",
    description: "Item stok kartlari",
    access: { domainKey: "shipyard", capabilityKey: "stok" },
  },
  {
    path: "/izinler",
    label: "Izin Takibi",
    description: "Leave Application ve Allocation ozeti",
    access: { domainKey: "shipyard" },
  },
  {
    path: "/mesai",
    label: "Mesai",
    description: "Fazla mesai takibi ve girisi",
    access: { domainKey: "shipyard" },
  },
  {
    path: "/mesai-onay",
    label: "Mesai Onay",
    description: "Toplu mesai onay kuyrugu",
    access: { domainKey: "shipyard" },
  },
  {
    path: "/alis-faturalari",
    label: "Alis Faturalari",
    description: "Purchase Invoice liste ve odeme durumu",
    access: { domainKey: "shipyard" },
  },
  {
    path: "/personel",
    label: "Personel",
    description: "Personel listesi",
  },
  {
    path: "/ik-kurulum",
    label: "IK Kurulum",
    description: "Temel IK master veri kontrolu",
  },
  {
    path: "/aday-takip",
    label: "Aday Takip",
    description: "Acik pozisyon ve aday havuzu",
  },
  {
    path: "/ise-giris-sureci",
    label: "Ise Giris",
    description: "Onboarding takip ve hazirlik",
  },
  {
    path: "/isten-cikis-sureci",
    label: "Isten Cikis",
    description: "Offboarding ve iade sureci",
  },
  {
    path: "/maas",
    label: "Maas",
    description: "Maas yonetimi ve bordro",
    access: { domainKey: "shipyard" },
  },
  {
    path: "/maas-hesapla",
    label: "Bordro Hesapla",
    description: "Aylik bordro hesaplama",
    access: { domainKey: "shipyard" },
  },
  {
    path: "/mesai-saat",
    label: "Mesai Saat Girisi",
    description: "Coklu personel icin giris/cikis ve ay sonu maas onizleme",
    access: { domainKey: "shipyard", capabilityKey: "vardiya" },
  },
  {
    path: "/kullanici-yetki",
    label: "Kullanici Yetki",
    description: "Admin rol ve kullanici yonetimi",
    adminOnly: true,
  },
  {
    path: "/ayarlar",
    label: "Ayarlar",
    description: "Tenant ayarlari ve izin turleri",
    adminOnly: true,
  },
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
  const editSuffix = "/duzenle";
  const detailPrefix = "/personel/";

  if (normalizedPath === "/personel") {
    return { route: "/personel" as const, employeeId: null };
  }

  if (normalizedPath === createPath) {
    return { route: "/personel/yeni" as const, employeeId: null };
  }

  if (normalizedPath.startsWith(detailPrefix)) {
    const detailPath = normalizedPath.slice(detailPrefix.length);
    if (detailPath.endsWith(editSuffix)) {
      const encodedId = detailPath.slice(0, -editSuffix.length).replace(/\/+$/, "");
      const employeeId = decodeURIComponent(encodedId);

      if (employeeId.length > 0) {
        return { route: "/personel/:employeeId/duzenle" as const, employeeId };
      }
    }

    const encodedId = detailPath;
    const employeeId = decodeURIComponent(encodedId);

    if (employeeId.length > 0) {
      return { route: "/personel/:employeeId" as const, employeeId };
    }
  }

  return null;
}
