# HR Employee Document Record (2026-04-25)

## Scope
- Ozluk dosyasi takip modeli `File`-only yaklasimindan `Employee Document Record` DocType'a tasindi.
- Personel detay ekrani yeni modelle entegre edildi.

## Backend
- `tenant_onboarding.ensure_employee_document_record_doctype` eklendi.
- Bootstrap akislarina eklendi:
  - `bootstrap_tenant_defaults`
  - `bootstrap_shipyard_setup`
- `personnel_api.list_employee_document_records(employee_id)` endpointi eklendi.
  - Belge satirlarini doner.
  - `file_ref` baglantisi varsa `File` kaydindan `file_name`, `file_url`, `is_private` eklenir.

## Frontend
- `personnelService` belge ozetini yeni endpointten okur.
- Endpoint hata verirse `File` tablosuna fallback devam eder.
- Belge ozeti:
  - `totalDocuments`
  - `missingCount`
  - `expiredCount`
  - `expiringSoonCount`
- Personel detay ekraninda kart guncellendi:
  - checklist
  - suresi dolan/yaklasan ozeti
  - belge satirinda belge durumu + gecerlilik tarihi

## Integration Notes
- `hooks.py` fixtures DocType listesine `Employee Document Record` eklendi.
- Bu adimda belge kaydi olusturma formu eklenmedi; sonraki adimda eklenecek.

