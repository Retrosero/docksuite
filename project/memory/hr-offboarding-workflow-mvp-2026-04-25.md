# HR Offboarding Workflow MVP - 2026-04-25

## Scope
- Faz 2 ucuncu adim olarak `Isten Cikis Sureci` ekraninin ilk surumu acildi.
- Route: `/isten-cikis-sureci`
- Veri kaynagi: standart `Employee Separation` kayitlari

## Implemented
- Yeni feature katmani:
  - `src/features/hr-offboarding/types.ts`
  - `src/features/hr-offboarding/services/hrOffboardingService.ts`
  - `src/features/hr-offboarding/hooks/useHrOffboardingData.ts`
  - `src/features/hr-offboarding/components/HrOffboardingScreen.tsx`
- Yeni page:
  - `src/pages/hr/OffboardingPage.tsx`
- App entegrasyonu:
  - `app/routes.ts` -> `/isten-cikis-sureci`
  - `app/App.tsx` route entry
  - `app/AppShell.tsx` menu icon + Yonetim grup baglantisi

## Data/Mapping Notes
- Offboarding listesinde:
  - personel, departman, unvan
  - separation durumu
  - ayrilis talebi / fiili ayrilis tarihi
- Opsiyonel baglanti ozetleri:
  - `Exit Interview` sayisi (personel bazli)
  - `Full and Final Statement` sayisi (personel bazli)
  - `Zimmet` acik kayit sayisi (personel bazli)
- Risk notlari:
  - ayrilis tarihi eksigi
  - acik zimmet varligi
  - exit interview eksigi
  - final hesaplasma kaydi eksigi

## Robustness
- `canReadDoctype` ile yetki kontrollu cagri.
- Field uyumsuzlugunda fallback field set denemeleri.
- Endpoint/izin hatalarinda UI Turkce hata durumuna duser.

## Verification Targets
- `npm test`
- `npm run build`
