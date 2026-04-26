# HR Spec 23 - Self Service Required Document Types Binding

## Goal
- `Calisan Paneli` belge formundaki belge turu alanini tenant-config zorunlu belge listesi ile beslemek.

## Scope
- Frontend only: `shipyard-portal`
- Feature: `src/features/hr-self-service`
- Data source:
  - `GET /api/method/shipyard_app.platform.api.get_operational_settings`

## UX
- `Belge Turu` alani serbest metin olarak kalir ancak tenant zorunlu belge tiplerini datalist olarak onerir.
- Tenant bazli zorunlu belge listesi bossa fallback varsayilan liste kullanilir.

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Self-service data payload'i `requiredDocumentTypes` listesi dondurur.
- Operational settings endpoint erisilemezse fallback liste ile fail-safe devam edilir.

## Acceptance Criteria
- Calisan paneli belge formunda tenant-config belge tipleri onerilir.
- Form akisi (upload + kaydet) mevcut davranisini korur.
- `npm test` ve `npm run build` basarili olur.
