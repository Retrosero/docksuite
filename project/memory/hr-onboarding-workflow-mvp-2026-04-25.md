# HR Onboarding Workflow MVP - 2026-04-25

## Scope
- Faz 2 ikinci adim olarak `Ise Giris Sureci` ekraninin ilk surumu acildi.
- Route: `/ise-giris-sureci`
- Veri kaynagi: standart `Employee Onboarding` kayitlari

## Implemented
- Yeni feature katmani:
  - `src/features/hr-onboarding/types.ts`
  - `src/features/hr-onboarding/services/hrOnboardingService.ts`
  - `src/features/hr-onboarding/hooks/useHrOnboardingData.ts`
  - `src/features/hr-onboarding/components/HrOnboardingScreen.tsx`
- Yeni page:
  - `src/pages/hr/OnboardingPage.tsx`
- App entegrasyonu:
  - `app/routes.ts` -> `/ise-giris-sureci`
  - `app/App.tsx` route entry
  - `app/AppShell.tsx` menu icon + Yonetim grup baglantisi

## Data/Mapping Notes
- Onboarding listesinde:
  - personel, departman, unvan
  - onboarding durumu
  - baslangic / ise giris / guncelleme tarihi
- Opsiyonel baglanti ozetleri:
  - `Employee Document Record` sayisi (personel bazli)
  - `Zimmet` acik kayit sayisi (personel bazli)
- Risk notlari:
  - ise giris tarihi eksigi
  - belge kaydi eksigi
  - acik zimmet varligi

## Robustness
- `canReadDoctype` ile yetki kontrollu cagri.
- Field uyumsuzlugunda fallback field set denemeleri.
- Endpoint/izin hatalarinda UI Turkce hata durumuna duser.

## Verification Targets
- `npm test`
- `npm run build`
