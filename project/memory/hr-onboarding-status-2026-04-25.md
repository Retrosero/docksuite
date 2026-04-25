# HR Onboarding Status - 2026-04-25

## Context
- Faz 1 icin personel detayinda onboarding gorunurlugu eksikti.
- Belge, zimmet ve attendance akislarindan sonra ise giris sureci karti eklendi.

## Implemented
- Backend (`personnel_api.py`)
  - `list_employee_onboarding_records(employee_id, limit=12)` endpointi eklendi.
  - Endpoint `Employee Onboarding` icin kolon-varlik kontrollu alan secimi yapiyor.
  - DocType tenant'ta yoksa bos liste donuyor (guvenli fallback).

- Frontend (`personnelService.ts`)
  - `PersonnelOnboardingSummaryType` modeli ile onboarding ozet hesaplamasi eklendi.
  - Yeni fetch: `/api/method/shipyard_app.personnel_api.list_employee_onboarding_records`
  - Durum siniflandirma:
    - Tamamlandi
    - Devam Ediyor
    - Beklemede
  - `getPersonnelDetail` cikisina `onboardingSummary` eklendi.

- Frontend UI (`PersonnelDetailScreen.tsx`)
  - Yeni kart: `Ise Giris Sureci`
  - Ozet metrikler + son onboarding kayitlari listeleme
  - Durum etiketi icin mavi `Devam Ediyor` tonu eklendi.

## Technical Notes
- Yeni DocType acilmadi; mevcut ERPNext `Employee Onboarding` kullanildi.
- Tenant-safe davranis korundu; tek firma ozel kural kodlanmadi.

## Verification Targets
- backend compile
- frontend test
- frontend build
