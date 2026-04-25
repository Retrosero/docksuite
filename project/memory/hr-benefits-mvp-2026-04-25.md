# HR Benefits MVP - 2026-04-25

## Scope
- Faz 3 dorduncu adim olarak `Yan Haklar` ekraninin ilk surumu acildi.
- Route: `/yan-haklar`
- Veri kaynagi: `Employee Benefit Application`, `Employee Benefit Claim`, `Additional Salary`

## Implemented
- Yeni feature katmani:
  - `src/features/hr-benefits/types.ts`
  - `src/features/hr-benefits/services/hrBenefitsService.ts`
  - `src/features/hr-benefits/hooks/useHrBenefitsData.ts`
  - `src/features/hr-benefits/components/HrBenefitsScreen.tsx`
- Yeni page:
  - `src/pages/hr/BenefitsPage.tsx`
- App entegrasyonu:
  - `app/routes.ts` -> `/yan-haklar`
  - `app/App.tsx` route entry
  - `app/AppShell.tsx` menu icon + Yonetim grup baglantisi

## Data/Mapping Notes
- Benefit application:
  - personel + benefit tipi + donem + durum
- Benefit claim:
  - personel + claim tutari + durum + tarih
- Additional salary:
  - personel + salary component + tutar + bordro tarihi + durum

## Robustness
- `canReadDoctype` ile yetki kontrollu cagri.
- Field uyumsuzlugunda fallback field set denemeleri.
- Durum tonu normalize edilerek UI badge rengine cevrilir.
- Endpoint/izin hatalarinda UI Turkce hata durumuna duser.

## Verification Targets
- `npm test`
- `npm run build`
