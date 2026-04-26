# HR Spec 19 - Employee Self Service MVP

## Goal
- IK modulunde `Calisan Paneli` ekraninin ilk MVP surumunu acmak.
- Calisanin kendi profil, attendance, izin, masraf, bordro ve belge risk ozetini tek sayfada sunmak.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/calisan-paneli`
- Feature: `src/features/hr-self-service`
- Data source:
  - `GET /api/method/frappe.auth.get_logged_user`
  - `GET /api/resource/Employee`
  - `GET /api/resource/Attendance`
  - `GET /api/resource/Leave Application`
  - `GET /api/resource/Expense Claim`
  - `GET /api/resource/Salary Slip`
  - `GET /api/resource/Employee Document Record`

## UX
- Ust profil ozeti:
  - personel kimligi
  - departman / unvan
  - ise giris tarihi ve durum
- Ozet kartlari:
  - son attendance durumu
  - bekleyen izin sayisi
  - bekleyen masraf sayisi
  - son net maas
- Hizli aksiyonlar:
  - izin talebi
  - masraf listesi
  - bordro ozeti
  - personel karti
- Liste panelleri:
  - bekleyen izin talepleri
  - bekleyen masraf talepleri
  - son bordro kayitlari
  - riskli belge kayitlari

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Permission-gated fetch (`canReadDoctype`) uygulanir.
- Oturum kullanicisi `Employee.user_id` ile eslestirilir.
- Eslestirme yoksa ekran Turkce bilgi mesaji ile fail-safe calisir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `HrSelfServiceScreen`
- `useHrSelfServiceData`
- `hrSelfServiceService`
- `EmployeeSelfServicePage`

## Acceptance Criteria
- `/calisan-paneli` route'u menu altinda acilir.
- Backend/izin problemi varsa Turkce hata mesaji gosterilir.
- Oturum kullanicisina bagli personel icin self-service panel verisi yuklenir.
- Personel eslesmesi yoksa ekran bos degil, yonlendirici bilgi mesaji verir.
- `npm test` ve `npm run build` basarili olur.
