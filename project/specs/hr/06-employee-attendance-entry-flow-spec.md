# HR Spec 06 - Employee Attendance Entry Flow

## Goal
- Personel detay ekranindan calisan attendance kayitlarini yonetmek:
  - listeleme
  - yeni kayit
  - mevcut kaydi duzeltme
  - kayit silme

## Scope
- Backend: `shipyard_app.personnel_api`
- Frontend: `shipyard-portal` personel detay sayfasi
- Data source: ERPNext `Attendance` DocType

## Backend Endpoints

### `list_employee_attendance_records(employee_id, limit=31)`
- Input:
  - `employee_id` (required)
  - `limit` (optional, 1..100)
- Output:
  - `items[]`: `name`, `employee`, `attendance_date`, `status`, `shift?`, `in_time?`, `out_time?`, `working_hours?`, `modified`

### `upsert_employee_attendance_record(record_id=None, payload=None, **kwargs)`
- Input:
  - required: `employee`, `attendance_date`
  - optional: `status`, `shift`, `in_time`, `out_time`
  - `record_id` verilirse update
  - `record_id` verilmezse `employee + attendance_date` kaydi varsa update, yoksa create
- Output:
  - `{ created, updated, name }`

### `delete_employee_attendance_record(record_id)`
- Input:
  - `record_id` (required)
- Output:
  - `{ deleted, name }`

## Frontend Flow
- Personel detayinda yeni "Attendance" karti:
  - Ozet: toplam, present, absent, leave
  - Son kayitlar listesi
  - Satir bazli `Duzelt` ve `Kaydi Sil`
  - Form:
    - tarih
    - durum
    - shift
    - in_time
    - out_time
- `Duzelt` aksiyonu secili kaydi forma doldurur.

## Validation
- `attendance_date` zorunlu
- `employee` zorunlu
- Silme aksiyonu kullanici onayi ile calisir

## SaaS / Multi-tenant Notes
- ERPNext core degismedi.
- Yeni DocType acilmadi; mevcut `Attendance` tekrar kullanildi.
- Tenant'a ozel sabit akis veya alan kodlanmadi.
