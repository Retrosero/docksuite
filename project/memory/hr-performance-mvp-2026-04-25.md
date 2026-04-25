# HR Performance MVP - 2026-04-25

## Scope
- Faz 4 ilk adim olarak `Performans` ekraninin ilk surumu acildi.
- Route: `/performans`
- Veri kaynagi: `Goal`, `Appraisal Cycle`, `Appraisal`, `Employee Performance Feedback`

## Implemented
- Yeni feature katmani:
  - `src/features/hr-performance/types.ts`
  - `src/features/hr-performance/services/hrPerformanceService.ts`
  - `src/features/hr-performance/hooks/useHrPerformanceData.ts`
  - `src/features/hr-performance/components/HrPerformanceScreen.tsx`
- Yeni page:
  - `src/pages/hr/PerformancePage.tsx`
- App entegrasyonu:
  - `app/routes.ts` -> `/performans`
  - `app/App.tsx` route entry
  - `app/AppShell.tsx` menu icon + Yonetim grup baglantisi

## Data/Mapping Notes
- Goal:
  - personel + hedef konusu + ilerleme + durum
- Appraisal Cycle:
  - donem adi + baslangic/bitis + durum
- Appraisal:
  - personel + donem + skor + durum
- Employee Performance Feedback:
  - personel + referans + geri bildirim ozeti

## Robustness
- `canReadDoctype` ile yetki kontrollu cagri.
- Field uyumsuzlugunda fallback field set denemeleri.
- Durum tonu normalize edilerek UI badge rengine cevrilir.
- Endpoint/izin hatalarinda UI Turkce hata durumuna duser.

## Verification Targets
- `npm test`
- `npm run build`
