# HR Zimmet Entry Flow - 2026-04-25

## Context
- Personel detay ekraninda belge kaydi akisi tamamlandiktan sonra,
  ayni sayfada zimmet takibi eksik kaldigi icin bu adim eklendi.

## Implemented
- Backend:
  - `list_employee_zimmet_records`
  - `upsert_employee_zimmet_record`
  - `delete_employee_zimmet_record`
- Frontend:
  - Personel detail type modeline `zimmetSummary` eklendi.
  - Servis katmanina zimmet summary cekimi ve mutation cagirilari eklendi.
  - Personel detay ekranina:
    - zimmet ozet karti
    - son kayit listesi
    - yeni kayit formu
    - kayit silme aksiyonu
    eklendi.

## Technical Decisions
- Yeni DocType acilmadi; mevcut `Zimmet` DocType tekrar kullanildi.
- Personel sayfasinda veri tekrarini engellemek icin backend endpointleri
  employee odakli filtreli response dondu.
- Ozet metrikler frontend tarafinda hesaplandi (total/open/full return).

## Verification Targets
- `personnel_api.py` compile
- frontend `npm run build`
- frontend `npm test`
