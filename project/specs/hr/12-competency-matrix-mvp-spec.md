# HR Spec 12 - Competency Matrix MVP

## Goal
- IK modulunde `Yetkinlik Matrisi` ekraninin ilk MVP surumunu acmak.
- Standart ERPNext yetkinlik kayitlarini pozisyon ve personel bazli sade bir panelde gostermek.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/yetkinlik-matrisi`
- Feature: `src/features/hr-competency`
- Data source:
  - `GET /api/resource/Skill`
  - `GET /api/resource/Employee Skill Map`
  - `GET /api/resource/Employee` (ad/departman/unvan tamamlama)

## UX
- Ozet kartlari:
  - aktif yetkinlik sayisi
  - skill map kaydi sayisi
  - eslesen personel sayisi
  - toplam atama sayisi
  - eksik skill satiri olan kayit sayisi
- Pozisyon bazli yogunluk listesi
- En cok atanan yetkinlik kapsami listesi
- Personel yetkinlik kartlari

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Permission-gated fetch (`canReadDoctype`) uygulanir.
- Alan farkliliklari icin fallback field-set denemeleri yapilir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `HrCompetencyScreen`
- `useHrCompetencyData`
- `hrCompetencyService`
- `CompetencyMatrixPage`

## Acceptance Criteria
- `/yetkinlik-matrisi` route'u menu altinda acilir.
- Backend/izin problemi varsa Turkce hata mesaji gosterilir.
- Skill map verisiyle ozet + kapsama + personel kartlari dolar.
- `npm test` ve `npm run build` basarili olur.
