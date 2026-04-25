# HR Spec 08 - Recruitment Pipeline MVP

## Goal
- IK modulunde `Aday Takip` sayfasinin ilk MVP surumunu acmak.
- Standart ERPNext Recruitment veri modellerini (`Job Opening`, `Job Applicant`) portalda sade sekilde gostermek.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/aday-takip`
- Feature: `src/features/hr-recruitment`
- Data source:
  - `GET /api/resource/Job Opening`
  - `GET /api/resource/Job Applicant`

## UX
- Ust ozet kartlari:
  - toplam pozisyon
  - acik pozisyon
  - toplam aday
  - son 7 gun yeni aday
- Asama dagilimi:
  - Basvuru
  - On Eleme
  - Mulakat
  - Teklif
  - Ise Alindi
  - Reddedildi
  - Diger
- Iki ana liste:
  - Pozisyon listesi (departman/unvan/tarih/aday sayisi)
  - Aday listesi (ad, e-posta, pozisyon, kaynak, asama, basvuru tarihi)

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Permission-gated fetch uygulanir (`canReadDoctype`).
- Alan farkliliklari icin fallback field-set denemeleri kullanilir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `HrRecruitmentScreen`
- `useHrRecruitmentData`
- `hrRecruitmentService`
- `RecruitmentPage`

## Acceptance Criteria
- `/aday-takip` route'u menu altinda acilir.
- Backend/izin problemi varsa Turkce hata mesaji gosterilir.
- `Job Opening` ve `Job Applicant` verisiyle ozet + liste ekrani dolar.
- `npm test` ve `npm run build` basarili olur.
