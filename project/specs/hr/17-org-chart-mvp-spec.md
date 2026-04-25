# HR Spec 17 - Organization Chart MVP

## Goal
- IK modulunde `Organizasyon Semasi` ekraninin ilk MVP surumunu acmak.
- Employee `reports_to` hiyerarsisini IK kullanicisi icin sade gorunurde sunmak.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/organizasyon-semasi`
- Feature: `src/features/hr-org-chart`
- Data source:
  - `GET /api/resource/Employee`

## UX
- Ozet kartlari:
  - toplam personel
  - yonetici sayisi
  - genis ekip lideri sayisi (5+ direkt rapor)
  - bagli personel sayisi
  - yoneticisi atanmamis personel sayisi
- Yonetici dugum listesi (direkt raporlarla)
- Departman dagilim listesi
- Yoneticiye bagli olmayan personel listesi

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Permission-gated fetch (`canReadDoctype`) uygulanir.
- Alan farkliliklari icin fallback field-set denemeleri yapilir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `HrOrgChartScreen`
- `useHrOrgData`
- `hrOrgChartService`
- `OrgChartPage`

## Acceptance Criteria
- `/organizasyon-semasi` route'u menu altinda acilir.
- Backend/izin problemi varsa Turkce hata mesaji gosterilir.
- Hiyerarsi, departman ozeti ve atanmamis personel listeleri yuklenir.
- `npm test` ve `npm run build` basarili olur.
