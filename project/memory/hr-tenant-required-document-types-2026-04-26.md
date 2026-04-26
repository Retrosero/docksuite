# HR Tenant Required Document Types - 2026-04-26

## Scope
- Personel ozluk checklist'inde zorunlu belge tipleri tenant-config bazli hale getirildi.
- Hardcode belge tipi listesi yerine `Tenant Settings` uzerinden yonetim eklendi.

## Implemented
- Backend (`shipyard_app.platform.api`)
  - Yeni field sabiti: `shipyard_hr_required_document_types`
  - `Tenant Settings` icin custom field olusturma adimi eklendi.
  - `get_operational_settings` output'u genisletildi:
    - `hr_required_document_types_text`
    - `hr_required_document_types`
  - `save_operational_settings` input'u genisletildi:
    - `hr_required_document_types_text`
  - Konfig bos ise fallback varsayilan belge listesi ile donus saglandi.
- Frontend (`tenant-settings`)
  - Operasyon ayarlarina `IK Zorunlu Belge Tipleri` textarea alani eklendi.
  - Kaydetme akisinda `saveOperationalSettings` payload'una yeni alan eklendi.
- Frontend (`personnelService`)
  - Checklist required type kaynagi `get_operational_settings` cevabina baglandi.
  - Endpoint/fetch hatasinda fallback varsayilan listeyle fail-safe devam ediyor.

## Verification
- `python -m compileall project/apps/shipyard_app/shipyard_app/platform/api.py` basarili
- `npm test` basarili
- `npm run build` basarili
