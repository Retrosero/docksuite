# HR Spec 10 - Offboarding Workflow MVP

## Goal
- IK modulunde `Isten Cikis Sureci` ekraninin ilk MVP surumunu acmak.
- Standart ERPNext `Employee Separation` kayitlarini sade bir offboarding panelinde gostermek.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/isten-cikis-sureci`
- Feature: `src/features/hr-offboarding`
- Data source:
  - `GET /api/resource/Employee Separation`
  - Opsiyonel baglanti ozeti:
    - `GET /api/resource/Exit Interview`
    - `GET /api/resource/Full and Final Statement`
    - `GET /api/resource/Zimmet`

## UX
- Ozet kartlari:
  - toplam kayit
  - tamamlanan
  - devam eden
  - bekleyen
  - zimmet riski
  - eksik exit interview
  - eksik final hesaplasma
- Durum dagilimi kapsulleri
- Kayit listesi:
  - personel + organizasyon bilgisi
  - talep ayrilis tarihi / fiili ayrilis tarihi
  - interview/final/zimmet ozetleri
  - risk notlari

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Permission-gated fetch (`canReadDoctype`) uygulanir.
- Alan farkliliklari icin fallback field-set denemeleri yapilir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `HrOffboardingScreen`
- `useHrOffboardingData`
- `hrOffboardingService`
- `OffboardingPage`

## Acceptance Criteria
- `/isten-cikis-sureci` route'u menu altinda acilir.
- Backend/izin problemi varsa Turkce hata mesaji gosterilir.
- Employee Separation kayitlariyla ozet + liste ekrani dolar.
- `npm test` ve `npm run build` basarili olur.
