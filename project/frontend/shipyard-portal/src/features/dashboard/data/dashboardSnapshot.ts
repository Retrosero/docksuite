import type { DashboardSnapshot } from "../types";

export const dashboardSnapshot: DashboardSnapshot = {
  headline: "Saha ekipleri icin hizli operasyon merkezi",
  subline:
    "Gorev, vardiya, saha bildirimi ve zimmet akislarini ERP karmasasina girmeden tek noktadan yonet.",
  activeTeamCount: "6 aktif ekip",
  openIssueCount: "4 acik saha bildirimi",
  modules: [
    {
      title: "Gorevlerim",
      description: "Bugunku operasyon listesini ac ve gecikmeleri aninda gor.",
      metric: "12 aktif gorev",
      tone: "sea"
    },
    {
      title: "Ekipler",
      description: "Atama ve uzmanlik dagilimini sade kartlarla yonet.",
      metric: "3 formen sahada",
      tone: "sand"
    },
    {
      title: "Saha Bildirimi",
      description: "Fotografli sorun bildirimlerini hizli kaydet ve sirala.",
      metric: "2 kritik kayit",
      tone: "steel"
    },
    {
      title: "Zimmet",
      description: "Teslim ve iade takibini ekipman bazinda temiz akista tamamla.",
      metric: "18 acik teslim",
      tone: "sun"
    }
  ],
  shift: {
    title: "Bugunku vardiya ozeti",
    timeRange: "07:30 - 17:30",
    teamName: "Boru Montaj Ekibi",
    focus: "Havuz-2 retrofit hazirligi",
    attendance: "24 / 26 personel giris yapti"
  }
};
