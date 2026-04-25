# HR Attendance Entry Flow - 2026-04-25

## Context
- Personel detayinda belge ve zimmet akislarindan sonra, attendance kayit yonetimi eksik parcaydi.
- Bu adimda personel karti icine attendance create/update/delete eklendi.

## Implemented
- Backend (`personnel_api.py`)
  - `list_employee_attendance_records`
  - `upsert_employee_attendance_record`
  - `delete_employee_attendance_record`
- Frontend
  - `PersonnelDetail` tip modeline `attendanceSummary` eklendi.
  - Servis katmani attendance ozetini cekip detay response'a bagladi.
  - Personel detay ekrani:
    - attendance ozet karti
    - son kayit listesi
    - satir bazli duzelt/sil aksiyonu
    - yeni kayit / duzeltme formu

## Technical Decisions
- Yeni kayit akisi mevcut `Attendance` DocType uzerinden kuruldu.
- `record_id` yoksa `employee + attendance_date` ile upsert davranisi eklenerek duzeltme kolaylastirildi.
- Opsiyonel alanlar (`shift`, `in_time`, `out_time`) doctype kolon varligina gore set edildi.

## Verification
- `python -m compileall project/apps/shipyard_app/shipyard_app/personnel_api.py`
- `npm run build`
- `npm test`
