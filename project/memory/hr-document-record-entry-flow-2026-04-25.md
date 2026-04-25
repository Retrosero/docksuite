# HR Document Record Entry Flow (2026-04-25)

## Scope
- Employee Document Record icin portal uzerinden veri giris/silme aksiyonu eklendi.

## Backend
- `shipyard_app.personnel_api.upsert_employee_document_record` eklendi.
- `shipyard_app.personnel_api.delete_employee_document_record` eklendi.
- Upsert endpoint hem create hem update akisini destekler.

## Frontend
- `PersonnelDetailScreen` icinde yeni belge kaydi formu eklendi.
- Son belge listesinde satir bazli `Kaydi Sil` aksiyonu eklendi.
- Kaydetme/silme sonrasi detay verisi yeniden yuklenir.
- Islem mesajlari:
  - basari: yesil mesaj
  - hata: kirmizi mesaj

## Notes
- Bu adimda dosya upload akisi eklenmedi; `file_ref` mevcut `File` kaydina link olarak alinir.
- Sonraki adimda dosya yukleme + `file_ref` secici iyilestirmesi planlanabilir.

