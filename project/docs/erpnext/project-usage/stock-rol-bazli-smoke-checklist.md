# Stok Modulu Rol-Bazli Smoke Checklist

## Kullanim Amaci
Bu checklist, stok modulu canli kullanim oncesi minimum kritik akislarin role gore hizli ve tekrar edilebilir sekilde dogrulanmasi icin hazirlandi.

## On Kosullar
- Kullanici ilgili role sahip olmalidir (Depo Sorumlusu / Formen / Yonetici).
- Test verisi en az 5 item, 2 warehouse ve aktif Bin kaydi icermelidir.
- Tenant operational settings icinde stok page-size ve kritik limit alanlari dolu olmalidir.

## Ortak Teknik Komutlar
```bash
cd project/frontend/shipyard-portal
npm test -- --run src/features/stock/services/stockService.spec.ts
npm run -s build
```

## Rol 1: Depo Sorumlusu

### Akis 1 - Stok Liste + Kritik Durum
- Adimlar:
  1. `/stok` ekranini ac.
  2. Kritik filtreyi aktif et.
  3. En az bir item detayina bak.
- Beklenen:
  - Liste hata vermeden acilir.
  - Kritik/normal rozetleri gorunur.
  - Depo dagilim kartlari veri gosterir.

### Akis 2 - Transfer Olusturma
- Adimlar:
  1. Bir item sec ve transfer quick-create ac.
  2. Kaynak/hedef depo ve miktar gir.
  3. Kaydet.
- Beklenen:
  - `Stock Entry` kaydi olusur.
  - Ekran yenileme sonrasi stok ozeti guncellenir.

### Akis 3 - Reconciliation Girisi
- Adimlar:
  1. Reconciliation panelinden satir sec.
  2. Sayim miktari girip kaydet.
- Beklenen:
  - `Stock Reconciliation` kaydi olusur.
  - Fark satiri panelde guncellenir.

## Rol 2: Formen

### Akis 1 - Material Request Olusturma
- Adimlar:
  1. Uyari merkezinden bir item icin hizli talep baslat.
  2. Miktar/depo bilgisi girip kaydet.
- Beklenen:
  - `Material Request` olusur.
  - Procurement panelinde acik talep sayisi artar.

### Akis 2 - Talep Durum Takibi
- Adimlar:
  1. Procurement workflow panelini yenile.
  2. Olusturulan talebin durumunu kontrol et.
- Beklenen:
  - Durum rozetleri dogru gorunur.
  - Hata varsa Turkce fail-safe mesaj cikar.

## Rol 3: Yonetici

### Akis 1 - KPI ve Audit Kontrolu
- Adimlar:
  1. Detay panellerini yukle.
  2. KPI paneli ve Audit panelini yenile.
- Beklenen:
  - KPI metrikleri sayisal deger dondurur.
  - Audit satirlari doctype/dokuman bazli listelenir.

### Akis 2 - CSV Export Paketi
- Adimlar:
  1. Export panelinden sirayla tum CSV butonlarini dene.
- Beklenen:
  - CSV dosyalari indirilebilir.
  - Satir sayisi export basina en fazla 500 olur.

## Hata Durumu Triage Kisa Notu
- Belirti: Panel bos veya hata mesaji.
- Ilk kontrol:
  - Rol yetkisi (`canReadDoctype`) var mi?
  - API yanitlari 200 donuyor mu?
  - Tenant settings icinde ilgili limit/esik alanlari dolu mu?
- Hala cozulmezse:
  - Ayni tenantta test kullanicisi ile tekrar dene.
  - Son degisiklik commit hash'i ile issue ac.
