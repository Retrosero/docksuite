# MVP Module Scope (Shipyard SaaS)

## 1) MVP modul listesi

Bu adimda sadece kapsam netlestirme vardir; implementasyon yoktur.

1. Gorev yonetimi
2. Ekip / atama
3. Vardiya / attendance kullanim katmani
4. Malzeme talep iliskilendirme
5. Zimmet
6. Saha bildirim
7. Teknik dokuman iliskilendirme

## 2) Modul bazli standard vs custom karari

### Gorev yonetimi
- Standard: `Project`, `Employee`
- Custom Field: `Material Request.shipyard_task_ref` (aday)
- New DocType: `Task`, `Task Progress`

### Ekip / atama
- Standard: `Employee`
- Custom Field: `Employee.shipyard_team_ref` (aday)
- New DocType: `Team`

### Vardiya / attendance kullanim
- Standard: `Shift Type`, `Attendance`, `Employee`
- Custom Field: `Attendance.shipyard_site_location`, `Attendance.shipyard_shift_note` (aday)
- New DocType: bu fazda zorunlu degil

### Malzeme talep
- Standard: `Item`, `Warehouse`, `Material Request`, `Stock Entry`
- Custom Field: `Item.shipyard_material_type`, `Item.shipyard_usage_zone`, `Item.is_critical_stock`, `Material Request.shipyard_request_priority` (aday)
- New DocType: bu fazda zorunlu degil

### Zimmet
- Standard: `Item`, `Employee` (referans)
- Custom Field: opsiyonel baglamsal alanlar
- New DocType: `Zimmet`

### Saha bildirim
- Standard: `Employee`, `File`
- Custom Field: opsiyonel baglamsal alanlar
- New DocType: `Field Report`

### Teknik dokuman iliskilendirme
- Standard: `File`, `Project`
- Custom Field: opsiyonel baglanti alanlari
- New DocType: `Technical Document Link`

## 3) Ilk kullanici tipleri (rol bazli urun bakisi)

1. Patron / firma sahibi
2. Yonetici
3. Muhendis
4. Formen
5. Isci
6. Depo sorumlusu
7. IK

Not: Bu adimda permission matrix tanimlanmadi; sadece urun rolu aday listesi cikarildi.

## 4) MVP disi (simdilik ertelendi)

- Ayrintili workflow tasarimi
- Detayli permission matrix
- Tenant bazli ileri konfig ekranlari
- Frontend ekran kodu
- Gercek DocType olusturma
