# HR Spec 11 - Training and Certificate MVP

## Goal
- IK modulunde `Egitim ve Sertifika` ekraninin ilk MVP surumunu acmak.
- Standart ERPNext egitim ve sertifika kayitlarini sade bir panelde gostermek.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/egitim-sertifika`
- Feature: `src/features/hr-training`
- Data source:
  - `GET /api/resource/Training Program`
  - `GET /api/resource/Training Event`
  - `GET /api/resource/Training Result`
  - `GET /api/resource/Training Feedback`
  - `GET /api/resource/Employee Document Record` (sertifika riski)

## UX
- Ozet kartlari:
  - program sayisi
  - etkinlik sayisi
  - sonuc sayisi
  - geri bildirim sayisi
  - riskli sertifika sayisi
  - yaklasan sertifika sayisi
- Son egitim etkinlikleri listesi
- Katilimci sonuc listesi
- Suresi dolan/yaklasan sertifika risk listesi

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Permission-gated fetch (`canReadDoctype`) uygulanir.
- Alan farkliliklari icin fallback field-set denemeleri yapilir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `HrTrainingScreen`
- `useHrTrainingData`
- `hrTrainingService`
- `TrainingPage`

## Acceptance Criteria
- `/egitim-sertifika` route'u menu altinda acilir.
- Backend/izin problemi varsa Turkce hata mesaji gosterilir.
- Egitim ve sertifika listeleri ozet kartlariyla birlikte yuklenir.
- `npm test` ve `npm run build` basarili olur.
