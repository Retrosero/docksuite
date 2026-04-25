# HR Expense and Advance MVP - 2026-04-25

## Scope
- Faz 3 ucuncu adim olarak `Avans ve Masraf` ekraninin ilk surumu acildi.
- Route: `/avans-masraf`
- Veri kaynagi: standart `Employee Advance`, `Expense Claim`, `Travel Request` kayitlari

## Implemented
- Yeni feature katmani:
  - `src/features/hr-expense/types.ts`
  - `src/features/hr-expense/services/hrExpenseService.ts`
  - `src/features/hr-expense/hooks/useHrExpenseData.ts`
  - `src/features/hr-expense/components/HrExpenseScreen.tsx`
- Yeni page:
  - `src/pages/hr/ExpenseAdvancePage.tsx`
- App entegrasyonu:
  - `app/routes.ts` -> `/avans-masraf`
  - `app/App.tsx` route entry
  - `app/AppShell.tsx` menu icon + Yonetim grup baglantisi

## Data/Mapping Notes
- Avans paneli:
  - `Employee Advance` kayitlari
  - talep tutari, durum, tarih
- Masraf paneli:
  - `Expense Claim` kayitlari
  - talep/onay tutari ve durum
- Seyahat paneli:
  - `Travel Request` kayitlari
  - seyahat tarih araligi ve durum

## Robustness
- `canReadDoctype` ile yetki kontrollu cagri.
- Field uyumsuzlugunda fallback field set denemeleri.
- Durum tonu hesaplamasi ortak helper ile normalize edilir.
- Endpoint/izin hatalarinda UI Turkce hata durumuna duser.

## Verification Targets
- `npm test`
- `npm run build`
