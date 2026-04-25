# Employee Document Record Entry Flow Spec

## Amac
Personel detay ekranindan belge kaydi ekleme, guncelleme ve silme aksiyonlarini acmak.

## Kapsam
Backend:
- `upsert_employee_document_record`
- `delete_employee_document_record`

Frontend:
- Personel detay ekraninda `Yeni belge kaydi` formu
- Son belge listesinde `Kaydi Sil` aksiyonu
- Islem sonrasi belge ozeti yenileme

## API
1. Upsert
- Method: `POST /api/method/shipyard_app.personnel_api.upsert_employee_document_record`
- Payload:
  - `record_id` (opsiyonel)
  - `employee`
  - `document_type`
  - `file_ref` (opsiyonel)
  - `issue_date` (opsiyonel)
  - `expiry_date` (opsiyonel)
  - `status`
  - `is_required`
  - `note` (opsiyonel)

2. Delete
- Method: `POST /api/method/shipyard_app.personnel_api.delete_employee_document_record`
- Payload:
  - `record_id`

## UI Kurallari
- Form alanlari:
  - belge turu
  - dosya ref
  - belge tarihi
  - gecerlilik bitis
  - durum
  - zorunlu
  - not
- Kaydetme ve silme sonrasi personel detay verisi tekrar cekilir.
- Hata/sonuc mesajlari Turkce gosterilir.

## Kabul Kriterleri
- Personel detay ekranindan belge kaydi eklenebilir.
- Belge kaydi silinebilir.
- Belge ozeti ve liste islemlerden sonra guncellenir.
- Build/test basarili olur.

