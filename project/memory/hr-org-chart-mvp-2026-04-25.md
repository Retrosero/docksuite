# HR Organization Chart MVP - 2026-04-25

## Scope
- Faz 4 ucuncu adim olarak `Organizasyon Semasi` ekraninin ilk surumu acildi.
- Route: `/organizasyon-semasi`
- Veri kaynagi: `Employee` doctype ve `reports_to` hiyerarsisi

## Implemented
- Yeni feature katmani:
  - `src/features/hr-org-chart/types.ts`
  - `src/features/hr-org-chart/services/hrOrgChartService.ts`
  - `src/features/hr-org-chart/hooks/useHrOrgData.ts`
  - `src/features/hr-org-chart/components/HrOrgChartScreen.tsx`
- Yeni page:
  - `src/pages/hr/OrgChartPage.tsx`
- App entegrasyonu:
  - `app/routes.ts` -> `/organizasyon-semasi`
  - `app/App.tsx` route entry
  - `app/AppShell.tsx` menu icon + Yonetim grup baglantisi

## Data/Mapping Notes
- Aktif personel listesi:
  - `Employee.status`/`employee_status` ile active filtre
- Hiyerarsi:
  - `reports_to` uzerinden yonetici -> direkt rapor map'i
- KPI:
  - manager count, top manager count, with/without manager count
- Departman:
  - department bazli headcount dagilimi

## Robustness
- `canReadDoctype` ile yetki kontrollu cagri.
- Field uyumsuzlugunda fallback field set denemeleri.
- Personel durum alani farkliliklari (`status`/`employee_status`) normalize edilir.
- Endpoint/izin hatalarinda UI Turkce hata durumuna duser.

## Verification Targets
- `npm test`
- `npm run build`
