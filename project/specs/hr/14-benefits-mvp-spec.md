# HR Spec 14 - Benefits MVP

## Goal
- IK modulunde `Yan Haklar` ekraninin ilk MVP surumunu acmak.
- Standart ERPNext yan hak ve ek odeme kayitlarini sade bir panelde gostermek.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/yan-haklar`
- Feature: `src/features/hr-benefits`
- Data source:
  - `GET /api/resource/Employee Benefit Application`
  - `GET /api/resource/Employee Benefit Claim`
  - `GET /api/resource/Additional Salary`

## UX
- Ozet kartlari:
  - toplam benefit application / claim / additional salary sayilari
  - bekleyen benefit application / claim / additional salary sayilari
- Benefit application listesi
- Benefit claim listesi
- Additional salary hareket listesi

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Permission-gated fetch (`canReadDoctype`) uygulanir.
- Alan farkliliklari icin fallback field-set denemeleri yapilir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `HrBenefitsScreen`
- `useHrBenefitsData`
- `hrBenefitsService`
- `BenefitsPage`

## Acceptance Criteria
- `/yan-haklar` route'u menu altinda acilir.
- Backend/izin problemi varsa Turkce hata mesaji gosterilir.
- Benefit + additional salary ozet ve listeleri yuklenir.
- `npm test` ve `npm run build` basarili olur.
