# Leave Department Flow Fix (2026-04-21)

## Problem
- `Yeni Izin Basvurusu` ekraninda izin kaydi olustururken `Could not find Department: <ad>` hatasi aliniyordu.
- Calisan kaydindaki `department` degeri, ERPNext `Department` kaydina her tenantta dogrudan cozulmeyebiliyordu.

## Backend Fix
- `shipyard_app/platform/api.py`
  - `_resolve_department_company` eklendi:
    - oncelik: employee.company
    - fallback: global default company
    - fallback: ilk Company kaydi
  - `_ensure_department_master` company alacak sekilde guncellendi.
  - Department insert `ignore_mandatory=True` ile daha dayanikli hale getirildi.
  - `ensure_employee_department_link` artik employee.company bilgisini kullanarak Department kaydini olusturuyor/esliyor.

## Frontend Fix
- `TenantSettingsScreen`
  - Baslik `Izin ve Departman Ayarlari` yapildi.
  - Departman yonetimi formdaki ilk blok haline getirildi.
  - Acik yonlendirme metni eklendi: once departman tanimlama akisi.
- `LeaveCreatePage`
  - `Could not find Department` hatasi alindiginda kullaniciya Ayarlar ekranina yonlendiren Turkce, aksiyon odakli mesaj gosteriliyor.

## Validation
- Frontend build: `npm run build` basarili.
- Python compile: `python -m compileall project/apps/shipyard_app/shipyard_app/platform/api.py` basarili.
