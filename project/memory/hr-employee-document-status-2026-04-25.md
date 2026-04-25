# HR Employee Document Status (2026-04-25)

## Scope
- Faz 1 ikinci adim olarak personel detay ekranina `Ozluk Dosyasi Durumu` karti eklendi.
- Model karari bu adimda `Employee + File` olarak netlestirildi.

## Model Decision
- `MVP-1`: `File` kayitlari ile belge gorunurlugu
  - `attached_to_doctype = Employee`
  - `attached_to_name = <employee_id>`
- `MVP-2`: `Employee Document Record` DocType
  - expiry/status/is_required gibi alanlar sonraki adimda eklenecek.

## Implemented
- Yeni spec:
  - `project/specs/hr/02-employee-document-status-spec.md`
- Frontend:
  - `personnelService` icinde `getPersonnelDocumentSummary` eklendi.
  - Personel detay modeline `documentSummary` eklendi.
  - `PersonnelDetailScreen` icinde yeni belge durum karti eklendi.
  - Checklist + eksik sayisi + son yuklenen belgeler gosteriliyor.
- Stil:
  - Belge karti ve checklist/list item siniflari global CSS'e eklendi.

## Checklist Rules (MVP)
- Kimlik Belgesi
- Is Sozlesmesi
- Saglik Raporu
- ISG Egitim Belgesi
- Mesleki Sertifika

## Notes
- Belge tipi siniflandirma dosya adina gore anahtar kelime esitlestirmesi ile yapiliyor.
- Bu adimda expiry/validity ve onay workflow'u yok.

