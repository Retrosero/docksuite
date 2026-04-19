# HR Demo Seed Log

## Date
- 2026-04-19

## Scope
- `frontend` site icin ERPNext uyumlu demo HR verisi uretildi.
- Kapsam: personel, aylik mesai, aylik izin, aylik bordro (Salary Slip).

## Script
- `project/apps/shipyard_app/shipyard_app/demo_hr_seed.py`
- Methods:
  - `seed_demo_hr_data`
  - `get_demo_hr_data_counts`

## Execution
- Command:
  - `bench --site frontend execute shipyard_app.demo_hr_seed.seed_demo_hr_data`
- Verification:
  - `bench --site frontend execute shipyard_app.demo_hr_seed.get_demo_hr_data_counts`

## Output Summary
- employees: `10`
- overtime_requests: `360`
- leave_applications: `360`
- salary_slips: `360`

## Notes
- Seed idempotent tasarlandi; tekrar calistirildiginda mevcut kayitlari tekrar olusturmaz.
- Veriler tek tenant hardcode'u olmadan demo alan adlariyla uretildi.
