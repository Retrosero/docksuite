export const tenantConfig = {
  productName: "Shipyard Portal",
  tenantLabel: "Tenant-safe baslangic konfigurasyonu",
  supportLabel: "Marka, renk ve endpoint ayarlari bu katmanda tutulur.",
  erpApiBaseUrl: import.meta.env.VITE_ERP_API_BASE_URL || "/api",
  erpSiteName: import.meta.env.VITE_ERP_SITE_NAME || "frontend"
};
