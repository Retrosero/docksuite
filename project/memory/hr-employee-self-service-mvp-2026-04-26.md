# HR Employee Self Service MVP - 2026-04-26

## Scope
- Faz 4 besinci adim olarak `Calisan Paneli` ekraninin ilk surumu acildi.
- Route: `/calisan-paneli`
- Veri kaynagi: `Employee`, `Attendance`, `Leave Application`, `Expense Claim`, `Salary Slip`, `Employee Document Record`

## Implemented
- Yeni feature katmani:
  - `src/features/hr-self-service/types.ts`
  - `src/features/hr-self-service/services/hrSelfServiceService.ts`
  - `src/features/hr-self-service/hooks/useHrSelfServiceData.ts`
  - `src/features/hr-self-service/components/HrSelfServiceScreen.tsx`
- Yeni page:
  - `src/pages/hr/EmployeeSelfServicePage.tsx`
- App entegrasyonu:
  - `app/routes.ts` -> `/calisan-paneli`
  - `app/App.tsx` route entry
  - `app/AppShell.tsx` menu icon + Yonetim grup baglantisi
  - `src/styles/global.css` self-service ekran stilleri

## Data/Mapping Notes
- Oturum kullanicisi `frappe.auth.get_logged_user` ile alinir.
- Calisan kaydi `Employee.user_id == oturum kullanicisi` ile eslestirilir.
- Son 7 gun attendance ozeti:
  - son attendance durumu + present/absent/on leave adetleri
- Bekleyen talepler:
  - `Leave Application` durum: `Open`, `Pending Approval`
  - `Expense Claim` durum: `Draft`, `Open`, `Pending`, `Pending Approval`, `Submitted`
- Son maas:
  - `Salary Slip` kayitlarindan en guncel net maas
- Belge riski:
  - `Employee Document Record` icinde `expired` ve `expiring soon`

## Robustness
- `canReadDoctype` ile doctype bazli permission-gated fetch.
- Session/employee eslesmesi yoksa ekran bilgi mesaji ile fail-safe calisir.
- Endpoint/izin hatalarinda UI Turkce hata durumuna duser.
- Tenant ozel hardcode akis eklenmedi.

## Verification Targets
- `npm test`
- `npm run build`
