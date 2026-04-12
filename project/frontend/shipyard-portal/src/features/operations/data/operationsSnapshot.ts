import type { OperationsSnapshot } from "../types";

export const operationsSnapshot: OperationsSnapshot = {
  headline: "Ilk operasyon ekranlari tek akista aciliyor",
  subline:
    "Gorev, ekip, saha bildirimi, zimmet ve attendance kullanimi mobil oncelikli kartlarla ayrik ama tutarli bir deneyimde ilerler.",
  stats: [
    {
      label: "Bugun acik gorev",
      value: "12",
      helper: "2 adet kritik gorev sirada"
    },
    {
      label: "Sahadaki ekip",
      value: "6",
      helper: "3 ekip aktif vardiyada"
    },
    {
      label: "Bekleyen saha kaydi",
      value: "4",
      helper: "1 kayit fotografa ihtiyac duyuyor"
    },
    {
      label: "Acik zimmet",
      value: "18",
      helper: "2 teslimat iade bekliyor"
    }
  ],
  actions: [
    {
      title: "Hizli gorev listesi",
      description: "Formenler bugunku isleri durum ve oncelige gore tek ekranda gorur.",
      cta: "Gorevleri ac",
      tone: "sea"
    },
    {
      title: "Ekip yonetimi",
      description: "Ekip, vardiya ve lider bilgisi saha kullanimi icin sade kartlarda tutulur.",
      cta: "Ekipleri gor",
      tone: "sand"
    },
    {
      title: "Saha bildirimi",
      description: "Sorun, foto ve konum bilgisini hizli toplamak icin mobil form kullanilir.",
      cta: "Bildirim al",
      tone: "steel"
    },
    {
      title: "Zimmet ve attendance",
      description: "Teslim-iade ile giris-cikis akislarini operasyondan koparmadan takip et.",
      cta: "Akisi ac",
      tone: "sun"
    }
  ],
  taskItems: [
    {
      title: "Havuz-2 kaynak hazirligi",
      team: "Boru Montaj",
      assignee: "M. Kaya",
      priority: "Yuksek",
      status: "Devam ediyor",
      dueLabel: "Bugun 16:00"
    },
    {
      title: "Guzergah kontrolu",
      team: "Saha Destek",
      assignee: "A. Yilmaz",
      priority: "Orta",
      status: "Beklemede",
      dueLabel: "Bugun 18:00"
    },
    {
      title: "Malzeme teslim onayi",
      team: "Depo",
      assignee: "S. Demir",
      priority: "Dusuk",
      status: "Tamamlandi",
      dueLabel: "Dun"
    }
  ],
  teamItems: [
    {
      name: "Boru Montaj Ekibi",
      lead: "C. Ozkan",
      specialty: "Kaynak ve hizalama",
      members: 8,
      shift: "07:30 - 17:30"
    },
    {
      name: "Saha Destek Ekibi",
      lead: "N. Arslan",
      specialty: "Ariza ve kontrol",
      members: 6,
      shift: "08:00 - 18:00"
    },
    {
      name: "Depo Vardiyasi",
      lead: "E. Karaca",
      specialty: "Malzeme ve teslimat",
      members: 5,
      shift: "06:30 - 16:30"
    }
  ],
  fieldReports: [
    {
      title: "Pompa dairesi sicaklik artisi",
      employee: "R. Aydin",
      location: "Blok C / Seviye 2",
      issueType: "Teknik ariza",
      severity: "Kritik",
      time: "09:14"
    },
    {
      title: "Korkuluk bağlantisi gevsek",
      employee: "T. Kaya",
      location: "Guzergah B",
      issueType: "ISG",
      severity: "Orta",
      time: "10:38"
    },
    {
      title: "Aydinlatma kablosu kontrolu",
      employee: "B. Yildiz",
      location: "Iskele 4",
      issueType: "Bakim",
      severity: "Dusuk",
      time: "11:20"
    }
  ],
  zimmetItems: [
    {
      title: "Kaynak maskesi",
      holder: "M. Kaya",
      quantity: "2 adet",
      status: "Teslim edildi",
      returnPlan: "Vardiya sonunda kontrol"
    },
    {
      title: "El terminali",
      holder: "S. Demir",
      quantity: "1 adet",
      status: "Iade bekliyor",
      returnPlan: "Bugun 17:30"
    },
    {
      title: "Koruyucu eldiven seti",
      holder: "C. Ozkan",
      quantity: "4 kutu",
      status: "Aktif",
      returnPlan: "Haftalik sarf takibi"
    }
  ],
  attendanceItems: [
    {
      label: "Giris yap",
      value: "24 / 26",
      detail: "Bugun ekipten 24 kisi giris kaydi verdi"
    },
    {
      label: "Cikis yap",
      value: "13 kisi",
      detail: "Yarim gun cikanlar otomatik ayriliyor"
    },
    {
      label: "Formen onayi",
      value: "5 bekliyor",
      detail: "Vardiya onayi icin kontrol listesi acik"
    }
  ]
};
