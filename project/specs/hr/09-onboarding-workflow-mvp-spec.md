# HR Spec 09 - Onboarding Workflow MVP

## Goal
- IK modulunde `Ise Giris Sureci` ekraninin ilk MVP surumunu acmak.
- Standart ERPNext `Employee Onboarding` kayitlarini portalda sade ve risk odakli gostermek.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/ise-giris-sureci`
- Feature: `src/features/hr-onboarding`
- Data source:
  - `GET /api/resource/Employee Onboarding`
  - Opsiyonel baglanti ozeti:
    - `GET /api/resource/Employee Document Record`
    - `GET /api/resource/Zimmet`

## UX
- Ozet kartlari:
  - toplam kayit
  - tamamlanan
  - devam eden
  - bekleyen
  - 7 gun icinde ise girecekler
  - belge riski
  - zimmet riski
- Durum dagilimi kapsulleri
- Kayit listesi:
  - personel + organizasyon bilgisi
  - baslangic / ise giris / son guncelleme
  - belge sayisi + acik zimmet sayisi
  - risk notlari

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Permission-gated fetch (`canReadDoctype`) uygulanir.
- Alan farkliliklari icin fallback field-set denemeleri yapilir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `HrOnboardingScreen`
- `useHrOnboardingData`
- `hrOnboardingService`
- `OnboardingPage`

## Acceptance Criteria
- `/ise-giris-sureci` route'u menu altinda acilir.
- Backend/izin problemi varsa Turkce hata mesaji gosterilir.
- Employee Onboarding kayitlariyla ozet + liste ekrani dolar.
- `npm test` ve `npm run build` basarili olur.
