# HR Spec 15 - Performance MVP

## Goal
- IK modulunde `Performans` ekraninin ilk MVP surumunu acmak.
- Standart ERPNext performans kayitlarini sade bir panelde gostermek.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/performans`
- Feature: `src/features/hr-performance`
- Data source:
  - `GET /api/resource/Goal`
  - `GET /api/resource/Appraisal Cycle`
  - `GET /api/resource/Appraisal`
  - `GET /api/resource/Employee Performance Feedback`

## UX
- Ozet kartlari:
  - goal, appraisal cycle, appraisal, feedback toplam sayilari
  - bekleyen goal ve appraisal sayilari
- Goal listesi
- Appraisal cycle listesi
- Appraisal listesi
- Performance feedback listesi

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Permission-gated fetch (`canReadDoctype`) uygulanir.
- Alan farkliliklari icin fallback field-set denemeleri yapilir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `HrPerformanceScreen`
- `useHrPerformanceData`
- `hrPerformanceService`
- `PerformancePage`

## Acceptance Criteria
- `/performans` route'u menu altinda acilir.
- Backend/izin problemi varsa Turkce hata mesaji gosterilir.
- Performans ozet + liste panelleri yuklenir.
- `npm test` ve `npm run build` basarili olur.
