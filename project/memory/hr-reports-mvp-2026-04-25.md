# HR Reports MVP - 2026-04-25

## Scope
- Faz 4 ikinci adim olarak `IK Raporlari` ekraninin ilk surumu acildi.
- Route: `/ik-raporlari`
- Veri kaynagi: `Employee`, `Attendance`, `Leave Application`, `Overtime Request`, `Salary Slip`, `Employee Document Record`

## Implemented
- Yeni feature katmani:
  - `src/features/hr-reports/types.ts`
  - `src/features/hr-reports/services/hrReportsService.ts`
  - `src/features/hr-reports/hooks/useHrReportsData.ts`
  - `src/features/hr-reports/components/HrReportsScreen.tsx`
- Yeni page:
  - `src/pages/hr/HrReportsPage.tsx`
- App entegrasyonu:
  - `app/routes.ts` -> `/ik-raporlari`
  - `app/App.tsx` route entry
  - `app/AppShell.tsx` menu icon + Yonetim grup baglantisi

## Data/Mapping Notes
- Headcount:
  - Employee toplam/aktif sayisi
- Attendance risk:
  - son 30 gunde `Absent` ve `Half Day` kayitlari
- Leave kuyrugu:
  - `Open`/`Pending Approval` Leave Application
- Mesai kuyrugu:
  - `Open`/`Pending Approval` Overtime Request sayisi
- Bordro:
  - son 60 gun Salary Slip kayit sayisi + net pay toplami
- Belge uyum:
  - Employee Document Record icinde `Expired`/`Expiring Soon`

## Robustness
- `canReadDoctype` ile yetki kontrollu cagri.
- Field uyumsuzlugunda fallback field set denemeleri.
- Overtime doctype'inda uyumsuzluk olursa fail-safe bos liste.
- Endpoint/izin hatalarinda UI Turkce hata durumuna duser.

## Verification Targets
- `npm test`
- `npm run build`
