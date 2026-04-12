import type { DashboardSnapshot } from "../types";

export const dashboardSnapshot: DashboardSnapshot = {
  headline: "Saha ekipleri icin hizli operasyon merkezi",
  subline:
    "Gorev, vardiya, saha bildirimi ve zimmet akislarini ERP karmasasina girmeden tek noktadan yonet.",
  sectionLabel: "Flowbite dashboard",
  summaryTitle: "Sabah operasyon ozeti",
  summarySubline: "Bugunun vardiya, gorev ve bildirim akislari tek bakista gorunur.",
  sidebarLabel: "Bugun aktif",
  sidebarNote: "Tersane ekipleri ve mobil saha akisleri senkron calisiyor.",
  sidebarStatLabel: "Tamamlanan is",
  sidebarStatValue: "18 / 24",
  sidebarStatHint: "Son 6 saatte kapanan gorevler",
  kpis: [
    {
      label: "Aktif gorev",
      value: "12",
      delta: "+3 bu sabah",
      tone: "sea"
    },
    {
      label: "Bekleyen onay",
      value: "4",
      delta: "2 kritik kalem",
      tone: "sand"
    },
    {
      label: "Acik saha bildirimi",
      value: "6",
      delta: "1 yeni kayit",
      tone: "steel"
    },
    {
      label: "Sahadaki personel",
      value: "26",
      delta: "24 giris yapti",
      tone: "sun"
    }
  ],
  workload: [
    {
      label: "Boru montaj",
      value: "42%",
      percent: 42,
      tone: "sea"
    },
    {
      label: "Retrofit hazirlik",
      value: "27%",
      percent: 27,
      tone: "sand"
    },
    {
      label: "Saha kontrol",
      value: "18%",
      percent: 18,
      tone: "steel"
    },
    {
      label: "Zimmet kapatma",
      value: "13%",
      percent: 13,
      tone: "sun"
    }
  ],
  tasks: [
    {
      title: "Havuz-2 kaynak noktasi kontrolu",
      owner: "Murat K.",
      team: "Boru Montaj Ekibi",
      dueTime: "10:30",
      priority: "Yuksek",
      status: "Kritik"
    },
    {
      title: "Zimmet iade listesi dogrulama",
      owner: "Elif T.",
      team: "Depo",
      dueTime: "11:15",
      priority: "Orta",
      status: "Bekliyor"
    },
    {
      title: "Saha bildirimi fotograf onayi",
      owner: "Cem A.",
      team: "Formen",
      dueTime: "12:00",
      priority: "Dusuk",
      status: "Hazir"
    }
  ],
  activities: [
    {
      title: "Yeni saha bildirimi alindi",
      detail: "Pruva hattinda hizalama sapmasi icin fotografli kayit olusturuldu.",
      time: "3 dk once",
      tone: "sea"
    },
    {
      title: "Zimmet teslimi tamamlandi",
      detail: "Koruyucu ekipman seti vardiya baslangicinda teslim edildi.",
      time: "18 dk once",
      tone: "sand"
    },
    {
      title: "Vardiya yoklamasi guncellendi",
      detail: "26 personelin 24'u sisteme giris yapti, 2 kisi beklemede.",
      time: "32 dk once",
      tone: "steel"
    }
  ],
  teams: [
    {
      name: "Boru Montaj Ekibi",
      role: "Imalat",
      load: "Yuksek",
      status: "Sahada"
    },
    {
      name: "Retrofit Destek",
      role: "Teknik",
      load: "Orta",
      status: "Hazir"
    },
    {
      name: "Depo ve Sevkiyat",
      role: "Lojistik",
      load: "Dusuk",
      status: "Kontrol"
    }
  ],
  actions: [
    {
      title: "Yeni gorev ac",
      description: "Saha, depo veya dokuman icin hizli is kaydi"
    },
    {
      title: "Saha bildirimi ekle",
      description: "Fotograf ve not ile anlik durum bildir"
    },
    {
      title: "Hizli zimmet",
      description: "Teslim ve iade akisini tek adimda tamamla"
    }
  ],
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
