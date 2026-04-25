# Employee Document Record DocType Spec

## Amac
Ozluk dosyasi takibini `File` baglantisindan daha yapisal bir modele tasimak:
- belge turu
- zorunluluk
- issue/expiry tarihi
- durum (Valid, Expiring Soon, Expired vb.)

## Model
DocType: `Employee Document Record`

Alanlar:
- `employee` (Link -> Employee, reqd)
- `employee_name` (Data, fetch_from employee.employee_name, read_only)
- `document_type` (Data, reqd)
- `file_ref` (Link -> File)
- `issue_date` (Date)
- `expiry_date` (Date)
- `status` (Select: Missing, Pending Review, Valid, Expiring Soon, Expired)
- `is_required` (Check, default 1)
- `note` (Small Text)

## Bootstrap
- `tenant_onboarding.ensure_employee_document_record_doctype` ile otomatik olusturulur.
- `bootstrap_tenant_defaults` ve `bootstrap_shipyard_setup` akisina eklidir.

## Frontend Integration
- Personel detay ekrani belge durumunu bu DocType kaynagindan okur.
- API: `shipyard_app.personnel_api.list_employee_document_records`
- Fallback: endpoint hata verirse `File` tablosundan eski baglantiyla ozet uretilir.

## Durum Hesabi
- `status` yoksa `expiry_date` uzerinden turetilir:
  - gecmis tarih => `Expired`
  - 30 gun ve alti => `Expiring Soon`
  - daha ilerisi => `Valid`
  - tarih yok => `Pending Review`

## UI Kapsami
- Personel detayinda:
  - toplam belge
  - eksik belge
  - suresi dolan belge
  - suresi yaklasan belge
  - checklist
  - son belge listesi

## Kabul Kriterleri
- Yeni tenant bootstrap sonrasinda DocType bulunur.
- Personel detayinda belge karti `Employee Document Record` verisiyle dolar.
- Build ve testler basarili olur.

