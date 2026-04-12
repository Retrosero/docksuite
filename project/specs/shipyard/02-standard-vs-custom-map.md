# Standard vs Custom Map (Shipyard SaaS)

## 1) ERPNext / HRMS standardinda kullanilacaklar

Bu yapilar MVP'de yeni DocType acmadan dogrudan kullanilacak:

- HR cekirdegi:
  - `Employee`
  - `Shift Type`
  - `Attendance`
  - `Leave`
  - `Salary Structure`
  - `Payroll Entry`
- Stok ve talep cekirdegi:
  - `Item`
  - `Warehouse`
  - `Material Request`
  - `Stock Entry`
  - `Purchase Order`
- Proje ve temel kayitlar:
  - `Project` (gorev baglami icin referans)
- Dosya:
  - `File` (teknik dokuman/fotograf eki)

## 2) Custom Field adaylari

Not: Bunlar "aday"tir, bu adimda olusturulmayacak.

### Item

1. `shipyard_material_type` (Select)
- Amac: malzeme/ekipmanin tersane operasyon sinifi
- Neden Custom Field yeterli: Item'in ozelligi, tekrar eden hareket degil
- Tenant-safe notu: secenekler urun standardi olmali; tenant farki gerekirse ayar tablosundan beslenmeli

2. `shipyard_usage_zone` (Data veya Select)
- Amac: malzemenin ana kullanim bolgesi (blok/atolye vb. sinif)
- Neden Custom Field yeterli: urun kart ozelligi
- Tenant-safe notu: tek firmaya ozel bolge kodlari sabitlenmemeli

3. `is_critical_stock` (Check)
- Amac: kritik stok takibi icin hizli siniflandirma
- Neden Custom Field yeterli: kart seviyesinde tekil nitelik
- Tenant-safe notu: kritik esik degeri ileride tenant ayarindan yonetilmeli

### Employee

4. `shipyard_team_ref` (Link -> Team)
- Amac: calisanin varsayilan operasyon ekibi
- Neden Custom Field yeterli: employee ustunde baglamsal ozellik
- Tenant-safe notu: Team modeli tenant icinde izole calisacak

5. `shipyard_specialty` (Select)
- Amac: uzmanlik alani (kaynak, boru, boya vb.)
- Neden Custom Field yeterli: calisan niteligi
- Tenant-safe notu: deger seti urun standardi + tenant config karmasi ile yonetilmeli

### Attendance

6. `shipyard_site_location` (Data veya Link)
- Amac: vardiya/giris-cikis kaydinin saha lokasyonu
- Neden Custom Field yeterli: attendance kaydina ek ozellik
- Tenant-safe notu: lokasyon kodlari tenant verisinden gelmeli

7. `shipyard_shift_note` (Small Text)
- Amac: formen/yonetici aciklama notu
- Neden Custom Field yeterli: tek kayit uzerinde aciklama
- Tenant-safe notu: metin serbest, sabit firma kurali yok

### Material Request

8. `shipyard_task_ref` (Link -> Task)
- Amac: malzeme talebini gorevle iliskilendirmek
- Neden Custom Field yeterli: mevcut talep belgesine baglanti ozelligi
- Tenant-safe notu: Task tenant icinde izole oldugu surece guvenli

9. `shipyard_request_priority` (Select)
- Amac: saha oncelik etiketi (dusuk/orta/yuksek/acil)
- Neden Custom Field yeterli: belge ozelligi
- Tenant-safe notu: oncelik seti urun genelinde standart tutulmali

## 3) New DocType adaylari (MVP minimum)

Not: Bu adimda sadece modelleme yapildi, gercek DocType acilmadi.

### 3.1 Task
- Amac: tersane operasyon gorevlerinin ana kaydi
- Neden standart yetmiyor: ERPNext standard task/proje yapisi saha operasyonu icin yeterli yalinklikta degil
- Neden New DocType: gorev kendi akisina, durumuna ve baglantilarina sahip tekrar eden islem kaydi
- Temel alanlar: ad, proje/gemi, bolge/blok, sorumlu ekip, sorumlu kisi, durum, oncelik, plan baslangic-bitis
- Baglanacagi standartlar: `Project`, `Employee`, `Item` (dolayli), `Material Request` (custom field bagi)
- SaaS tekrar kullanilabilirlik: tum tersanelerde gorev mantigi ortak

### 3.2 Team
- Amac: operasyon ekiplerinin tanimi
- Neden standart yetmiyor: Employee Group benzeri yapilar ekip-atama akisina dogrudan oturmuyor
- Neden New DocType: ekip kaydi tekrar kullanilan bagimsiz bir varlik
- Temel alanlar: ekip kodu, ekip adi, ekip tipi, aktiflik, varsayilan formen
- Baglanacagi standartlar: `Employee`
- SaaS tekrar kullanilabilirlik: ekip yapisi her tenantta tekrar kurulur

### 3.3 Task Progress
- Amac: gorev bazli ilerleme/gecmis olay kaydi
- Neden standart yetmiyor: Task icinde satir aciklama yerine bagimsiz zaman serisi kaydi gerekli
- Neden New DocType: tekrar eden islem/gecmis
- Temel alanlar: task ref, tarih-saat, ilerleme yuzdesi, durum degisimi, aciklama, giren kullanici
- Baglanacagi standartlar: `Employee` (giren/atanan), `Project` (task uzerinden)
- SaaS tekrar kullanilabilirlik: gorev ilerleme ihtiyaci tum tersanelerde ortak

### 3.4 Zimmet
- Amac: ekipman/malzeme teslim-iade gecmisi
- Neden standart yetmiyor: stok hareketleri zimmet sorumlulugunu tek basina takip etmez
- Neden New DocType: teslim/iade tekrar eden islem gecmisi
- Temel alanlar: employee, item, miktar, teslim tarihi, iade tarihi, durum, teslim eden, not
- Baglanacagi standartlar: `Employee`, `Item`, gerekirse `Warehouse`
- SaaS tekrar kullanilabilirlik: zimmet takibi her tenantta benzer

### 3.5 Field Report
- Amac: sahadan olay/sorun/fotograf bildirim toplamak
- Neden standart yetmiyor: Attendance veya Task notu saha bildirim akisina yetmez
- Neden New DocType: tekrar eden saha olayi kaydi
- Temel alanlar: task ref, employee, tarih-saat, aciklama, sorun tipi, durum, fotograf/file
- Baglanacagi standartlar: `Task`, `Employee`, `File`
- SaaS tekrar kullanilabilirlik: saha bildirim modeli genel urun fonksiyonu

### 3.6 Technical Document Link
- Amac: teknik dokumanlari gorev/alan ile iliskilendirmek
- Neden standart yetmiyor: dosya yukleme var ama operasyon baglami/etiket/revizyon iliskisi zayif
- Neden New DocType: birden cok dokuman bagi tekrarlayan iliski kaydi
- Temel alanlar: baglanan tur (task/proje), baglanan id, file ref/url, revizyon no, gecerlilik, aciklama
- Baglanacagi standartlar: `Task`, `Project`, `File`
- SaaS tekrar kullanilabilirlik: dokuman iliskilendirme tum tersanelerde ortak ihtiyac
