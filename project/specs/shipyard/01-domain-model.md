# Shipyard Domain Model (SaaS / Multi-Tenant)

## 1) Model ilkesi

Bu urun tek firma ic kullanimi degil, birden fazla tersane firmasina tekrar kurulabilir SaaS urundur.

- Tenant = site + veritabani izolasyonu (ERPNext/Frappe standardi)
- Kod tabani = ortak
- Is modeli = ortak urun davranisi
- Firma farklari = config/ayar katmani (ileriki asama)

## 2) Cekirdek domain sinirlari

ERPNext/HRMS cekirdekte kalacak ana sinirlar:

- HR ve payroll: `Employee`, `Shift Type`, `Attendance`, `Leave`, `Salary Structure`, `Payroll Entry`
- Stok/depo/satin alma: `Item`, `Warehouse`, `Material Request`, `Stock Entry`, `Purchase Order`
- Temel proje referansi: ERPNext proje kayitlari
- Dosya yonetimi: Frappe `File` altyapisi

Tersane urun katmani (custom app + sade frontend):

- Gorev yonetimi
- Ekip ve atama
- Zimmet
- Saha bildirim
- Gorev ilerleme kaydi
- Teknik dokuman iliskilendirme

## 3) Ana varliklar ve iliskiler

Standart varliklar:

- `Employee` (calisan)
- `Item` (malzeme/ekipman)
- `Attendance` (yoklama/mesai)
- `Material Request` (malzeme talebi)
- `Project` (proje/gemi referansi)

Custom aday varliklar:

- `Task`
  - Project ve sorumlu kisi/ekip ile iliskili ana gorev kaydi
- `Team`
  - Operasyonel ekip tanimi
- `Task Progress`
  - Task icin tekrarlayan ilerleme/olay kaydi
- `Zimmet`
  - Employee + Item baglantili teslim/iade gecmisi
- `Field Report`
  - Sahadan olay/not/fotograf bildirim kaydi
- `Technical Document Link`
  - Task veya ilgili nesne ile dokuman baglantisi

## 4) SaaS tekrar kullanilabilirlik kriteri

Her yeni yapi icin minimum kriter:

1. Tek bir firma adina veya surecine bagli sabit kurala dayanmamali.
2. Farkli tersanelerde ayni alan setiyle calisabilir olmali.
3. Tenant izolasyonunu bozacak ortak veri depolama kurmamali.
4. App/fixtures ile yeni tenant kurulumunda tekrar yuklenebilir olmali.
5. Ozellik niteligindeki alanlar once `Custom Field` ile cozulmeli; tekrar eden islem/gecmis ise `New DocType` secilmeli.
