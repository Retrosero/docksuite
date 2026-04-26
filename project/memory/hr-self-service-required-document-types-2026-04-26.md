# HR Self Service Required Document Types - 2026-04-26

## Scope
- `Calisan Paneli` belge kaydi formunda `Belge Turu` alani tenant-config zorunlu belge listesi ile baglandi.

## Implemented
- `src/features/hr-self-service/services/hrSelfServiceService.ts`
  - `get_operational_settings` uzerinden `hr_required_document_types` okuma eklendi.
  - normalize + fallback liste davranisi eklendi.
  - `HrSelfServiceData` cikisina `requiredDocumentTypes` eklendi.
- `src/features/hr-self-service/types.ts`
  - `HrSelfServiceData.requiredDocumentTypes` eklendi.
- `src/features/hr-self-service/components/HrSelfServiceScreen.tsx`
  - `Belge Turu` input'u datalist ile tenant belge tiplerini onerir hale getirildi.

## Verification
- `npm test` basarili
- `npm run build` basarili
