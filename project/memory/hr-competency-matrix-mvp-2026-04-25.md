# HR Competency Matrix MVP - 2026-04-25

## Scope
- Faz 3 ikinci adim olarak `Yetkinlik Matrisi` ekraninin ilk surumu acildi.
- Route: `/yetkinlik-matrisi`
- Veri kaynagi: standart `Skill` ve `Employee Skill Map` kayitlari

## Implemented
- Yeni feature katmani:
  - `src/features/hr-competency/types.ts`
  - `src/features/hr-competency/services/hrCompetencyService.ts`
  - `src/features/hr-competency/hooks/useHrCompetencyData.ts`
  - `src/features/hr-competency/components/HrCompetencyScreen.tsx`
- Yeni page:
  - `src/pages/hr/CompetencyMatrixPage.tsx`
- App entegrasyonu:
  - `app/routes.ts` -> `/yetkinlik-matrisi`
  - `app/App.tsx` route entry
  - `app/AppShell.tsx` menu icon + Yonetim grup baglantisi

## Data/Mapping Notes
- Skill katalogu:
  - `Skill` kayitlari aktif liste olarak alinir
- Personel yetkinlik map:
  - `Employee Skill Map` listesi cekilir
  - map detayindan skill satirlari parse edilerek personel kartina yazilir
- Personel metadatasi:
  - `Employee` doctype'i ile ad/departman/unvan fallback tamamlama yapilir

## Robustness
- `canReadDoctype` ile yetki kontrollu cagri.
- Field uyumsuzlugunda fallback field set denemeleri.
- Skill child-table alan adi farkliliklari icin toleransli parse.
- Endpoint/izin hatalarinda UI Turkce hata durumuna duser.

## Verification Targets
- `npm test`
- `npm run build`
