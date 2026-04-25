# HR Training and Certificate MVP - 2026-04-25

## Scope
- Faz 3 ilk adim olarak `Egitim ve Sertifika` ekraninin ilk surumu acildi.
- Route: `/egitim-sertifika`
- Veri kaynagi: standart ERPNext egitim ve sertifika kayitlari

## Implemented
- Yeni feature katmani:
  - `src/features/hr-training/types.ts`
  - `src/features/hr-training/services/hrTrainingService.ts`
  - `src/features/hr-training/hooks/useHrTrainingData.ts`
  - `src/features/hr-training/components/HrTrainingScreen.tsx`
- Yeni page:
  - `src/pages/hr/TrainingPage.tsx`
- App entegrasyonu:
  - `app/routes.ts` -> `/egitim-sertifika`
  - `app/App.tsx` route entry
  - `app/AppShell.tsx` menu icon + Yonetim grup baglantisi

## Data/Mapping Notes
- Takvim listesi:
  - `Training Event` kayitlari
  - Program adi (`Training Program`) eslestirmesi
- Sonuclar:
  - `Training Result` kayitlari
  - sonuc tonu: basarili / basarisiz / beklemede / belirsiz
- Sertifika riskleri:
  - `Employee Document Record` icinde `document_type` sertifika olan kayitlar
  - `status` = `Expired` veya `Expiring Soon` olanlar

## Robustness
- `canReadDoctype` ile doctype bazli yetki kontrollu cagri.
- Field uyumsuzlugunda fallback field set denemeleri.
- Endpoint/izin hatalarinda UI Turkce hata durumuna duser.

## Verification Targets
- `npm test`
- `npm run build`
