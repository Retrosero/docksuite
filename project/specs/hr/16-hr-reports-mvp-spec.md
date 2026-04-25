# HR Spec 16 - HR Reports MVP

## Goal
- IK modulunde `IK Raporlari` ekraninin ilk MVP surumunu acmak.
- Standart ERPNext IK operasyon verilerinden KPI ve risk listeleri uretmek.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/ik-raporlari`
- Feature: `src/features/hr-reports`
- Data source:
  - `GET /api/resource/Employee`
  - `GET /api/resource/Attendance`
  - `GET /api/resource/Leave Application`
  - `GET /api/resource/Overtime Request`
  - `GET /api/resource/Salary Slip`
  - `GET /api/resource/Employee Document Record`

## UX
- Ozet kartlari:
  - headcount (toplam/aktif)
  - bekleyen izin
  - bekleyen mesai
  - bordro kayit ve net toplam
  - devamsizlik riski
  - belge uyum riski
- Attendance risk listesi
- Bekleyen izin listesi
- Belge uyum riski listesi

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Permission-gated fetch (`canReadDoctype`) uygulanir.
- Alan farkliliklari icin fallback field-set denemeleri yapilir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `HrReportsScreen`
- `useHrReportsData`
- `hrReportsService`
- `HrReportsPage`

## Acceptance Criteria
- `/ik-raporlari` route'u menu altinda acilir.
- Backend/izin problemi varsa Turkce hata mesaji gosterilir.
- KPI + risk listeleri yuklenir.
- `npm test` ve `npm run build` basarili olur.
