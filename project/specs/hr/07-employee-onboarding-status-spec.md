# HR Spec 07 - Employee Onboarding Status

## Goal
- Personel detay ekraninda ise giris sureci gorunurlugunu acmak.
- ERPNext `Employee Onboarding` kayitlarini kopyalamadan listeleyip ozetlemek.

## Scope
- Backend: `shipyard_app.personnel_api`
- Frontend: `shipyard-portal` personel detay sayfasi
- Data source: standart `Employee Onboarding` DocType

## Backend Endpoint

### `list_employee_onboarding_records(employee_id, limit=12)`
- Input:
  - `employee_id` (required)
  - `limit` (optional, 1..50)
- Behavior:
  - `Employee Onboarding` DocType yoksa bos liste doner.
  - Alanlar kolon varligina gore dinamik secilir (`status`, `boarding_status`, `boarding_begins_on`, `date_of_joining` vb).
- Output:
  - `items[]`: `name`, `employee`, `status?`, `boarding_status?`, `boarding_begins_on?`, `date_of_joining?`, `department?`, `designation?`, `modified`

## Frontend Flow
- Personel detayinda yeni `Ise Giris Sureci` karti:
  - Ozet: toplam onboarding, tamamlanan, devam eden, bekleyen
  - Son onboarding kayitlari listesi
  - Her satirda:
    - kayit kimligi
    - baslangic ve ise giris tarihi
    - departman / unvan
    - durum etiketi

## Status Mapping Rules
- `complete/tamam` => `Tamamlandi`
- `progress/process/active/acik` => `Devam Ediyor`
- digerleri => `Beklemede`

## SaaS / Multi-tenant Notes
- Tenant ozel hardcode akis yok.
- Standart ERPNext DocType tekrar kullanilir.
- Veri duplicate edilmez; sadece mevcut kayit ozetlenir.

## Validation Targets
- `python -m compileall project/apps/shipyard_app/shipyard_app/personnel_api.py`
- `npm test`
- `npm run build`
