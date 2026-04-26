# HR Spec 22 - Tenant Config Required Document Types

## Goal
- Personel ozluk checklist'inde zorunlu belge tiplerini hardcode yerine tenant ayarindan yonetmek.
- SaaS yapida her tenantin farkli zorunlu belge setini konfig ile belirleyebilmesini saglamak.

## Scope
- Backend: `shipyard_app.platform.api`
- Frontend:
  - `tenant-settings` modulunde yeni ayar alanı
  - `personnelService` checklist olusturma akisi
- Data source:
  - `Tenant Settings` custom field
  - `get_operational_settings` / `save_operational_settings`

## UX
- Ayarlar ekraninda yeni alan:
  - `IK Zorunlu Belge Tipleri` (satir bazli metin)
- Kaydet ile bu liste tenant bazli saklanir.
- Personel detay checklist'i bu listeyi kullanir.

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- `Tenant Settings` icine custom field eklenir:
  - `shipyard_hr_required_document_types`
- `get_operational_settings` cevabina eklenir:
  - `hr_required_document_types_text`
  - `hr_required_document_types`
- `save_operational_settings` bu degeri yazacak sekilde genisletilir.
- Konfig bossa fallback varsayilan belge listesi kullanilir.

## Acceptance Criteria
- Tenant ayarlarinda zorunlu belge listesi kaydedilebilir.
- Personel checklist'i tenant ayarindaki listeye gore hesaplanir.
- Konfig bos veya endpoint erisimsizse fallback liste ile sistem calismaya devam eder.
- `python -m compileall`, `npm test`, `npm run build` basarili olur.
