# HR Recruitment Pipeline MVP - 2026-04-25

## Scope
- Faz 2 baslangici olarak `Aday Takip` ekraninin ilk surumu acildi.
- Route: `/aday-takip`
- Veri kaynagi: standart ERPNext Recruitment DocType'lari
  - `Job Opening`
  - `Job Applicant`

## Implemented
- Yeni feature katmani:
  - `src/features/hr-recruitment/types.ts`
  - `src/features/hr-recruitment/services/hrRecruitmentService.ts`
  - `src/features/hr-recruitment/hooks/useHrRecruitmentData.ts`
  - `src/features/hr-recruitment/components/HrRecruitmentScreen.tsx`
- Yeni page:
  - `src/pages/hr/RecruitmentPage.tsx`
- App entegrasyonu:
  - `app/routes.ts` -> `/aday-takip`
  - `app/App.tsx` route entry
  - `app/AppShell.tsx` menu icon + Yonetim grup baglantisi

## Data/Mapping Notes
- Pozisyon listesi:
  - title, status, department, designation, yayim/kapanis tarihi, aday sayisi
- Aday listesi:
  - ad, durum(asama etiketi), e-posta, pozisyon, kaynak, basvuru tarihi
- Status to stage mapping:
  - Basvuru, On Eleme, Mulakat, Teklif, Ise Alindi, Reddedildi, Diger
- Son 7 gun metriginde `Job Applicant.creation` kullanilir.

## Robustness
- `canReadDoctype` ile yetki kontrollu cagri.
- Field uyumsuzlugunda fallback field set denemeleri.
- Endpoint/izin hatalarinda UI Turkce hata durumuna duser.

## Verification Targets
- `npm test`
- `npm run build`
