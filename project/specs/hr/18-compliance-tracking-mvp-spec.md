# HR Spec 18 - Compliance Tracking MVP

## Goal
- IK modulunde `Uygunluk Takibi` ekraninin ilk MVP surumunu acmak.
- Saglik sigortasi ve zorunlu belge uygunluk risklerini sade panelde gostermek.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/uygunluk-takibi`
- Feature: `src/features/hr-compliance`
- Data source:
  - `GET /api/resource/Employee Health Insurance`
  - `GET /api/resource/Employee Document Record`
  - `GET /api/resource/Employee`

## UX
- Ozet kartlari:
  - toplam saglik sigortasi kaydi
  - sigorta risk sayisi
  - belge risk sayisi
  - sigorta kaydi eksik personel sayisi
- Sigorta risk listesi
- Belge uygunluk risk listesi
- Sigortasi olmayan aktif personel listesi

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Permission-gated fetch (`canReadDoctype`) uygulanir.
- Alan farkliliklari icin fallback field-set denemeleri yapilir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `HrComplianceScreen`
- `useHrComplianceData`
- `hrComplianceService`
- `CompliancePage`

## Acceptance Criteria
- `/uygunluk-takibi` route'u menu altinda acilir.
- Backend/izin problemi varsa Turkce hata mesaji gosterilir.
- Uygunluk KPI ve risk listeleri yuklenir.
- `npm test` ve `npm run build` basarili olur.
