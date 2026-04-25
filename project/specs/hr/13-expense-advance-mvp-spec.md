# HR Spec 13 - Expense and Advance MVP

## Goal
- IK modulunde `Avans ve Masraf` ekraninin ilk MVP surumunu acmak.
- Standart ERPNext avans, masraf ve seyahat taleplerini sade bir panelde gostermek.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/avans-masraf`
- Feature: `src/features/hr-expense`
- Data source:
  - `GET /api/resource/Employee Advance`
  - `GET /api/resource/Expense Claim`
  - `GET /api/resource/Travel Request`

## UX
- Ozet kartlari:
  - toplam avans/masraf/seyahat sayilari
  - bekleyen avans/masraf/seyahat sayilari
- Son avans talepleri listesi
- Son masraf talepleri listesi
- Seyahat onay kuyrugu listesi

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Permission-gated fetch (`canReadDoctype`) uygulanir.
- Alan farkliliklari icin fallback field-set denemeleri yapilir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `HrExpenseScreen`
- `useHrExpenseData`
- `hrExpenseService`
- `ExpenseAdvancePage`

## Acceptance Criteria
- `/avans-masraf` route'u menu altinda acilir.
- Backend/izin problemi varsa Turkce hata mesaji gosterilir.
- Avans/masraf/seyahat listeleri ve ozet kartlari yuklenir.
- `npm test` ve `npm run build` basarili olur.
