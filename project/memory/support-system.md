# Support and Operations System (Prompt 9)

## Scope
- Faz 9 hedefleri icin tenant destek/operasyon altyapisi eklendi.
- ERPNext core degistirilmeden, tamamen `shipyard_app` extension katmaninda ilerlenildi.

## Added Module
- `shipyard_app.operations_support`
  - Tenant registry yonetimi
  - Tenant bazli log goruntuleme API'si
  - Tenant versiyon takibi API'si
  - Support note kayit ve listeleme API'si

## Added Custom DocTypes
- `Tenant Registry`
  - Tenant listesi, aktif/pasif durum, versiyon alani
  - Saglik kontrolu ve operasyon notlari icin temel alanlar
- `Support Note`
  - Tenant bazli not/sorun gecmisi
  - Durum, tip, ozet, detay, referans alanlari

## API Surface
- `shipyard_app.operations_support.register_tenant`
- `shipyard_app.operations_support.list_tenants`
- `shipyard_app.operations_support.set_tenant_status`
- `shipyard_app.operations_support.update_tenant_version`
- `shipyard_app.operations_support.add_support_note`
- `shipyard_app.operations_support.list_support_notes`
- `shipyard_app.operations_support.get_tenant_logs`

## Bootstrap Integration
- `shipyard_app.tenant_onboarding.bootstrap_shipyard_setup` icine
  `operations_support.bootstrap_support_operations()` eklendi.
- Install/migrate sonrasi support altyapisi otomatik olusur.

## Hooks / Fixtures
- Hook fixture filtrelerine yeni DocType adlari eklendi:
  - `Tenant Registry`
  - `Support Note`

## Multi-tenant Notes
- Firmaya ozel hardcode deger eklenmedi.
- Tenant farklari kayit bazli (`Tenant Registry`) yonetilir.
- Veri modeli tekrar kurulabilir SaaS yapisina uygundur.
