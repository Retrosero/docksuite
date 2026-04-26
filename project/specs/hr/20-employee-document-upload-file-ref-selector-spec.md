# HR Spec 20 - Employee Document Upload and FileRef Selector

## Goal
- Personel detay ekranindaki `Yeni belge kaydi` akisini dosya yukleme ve `file_ref` secici ile tamamlamak.
- `Employee Document Record` olusturma adiminda manuel `file_ref` giris hatalarini azaltmak.

## Scope
- Frontend only: `shipyard-portal`
- Screen: `PersonnelDetailScreen` (`/personel/:employeeId`)
- Data source:
  - `POST /api/method/upload_file`
  - `GET /api/method/shipyard_app.personnel_api.list_employee_document_records`
  - `POST /api/method/shipyard_app.personnel_api.upsert_employee_document_record`

## UX
- Belge formunda `Dosya Ref` alani datalist secici ile mevcut dosya referanslarini onerir.
- Form icine `Dosya Yukle` bolumu eklenir:
  - dosya secimi
  - ozel/public secimi
  - `Dosyayi Yukle` aksiyonu
- Yukleme basariliysa `file_ref` alani otomatik doldurulur.
- Yukleme ve kayit hatalari Turkce mesaj ile gosterilir.

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Yuklenen dosya `Employee` kaydina bagli (`attached_to_doctype=Employee`, `attached_to_name=<employee_id>`) tutulur.
- Multipart upload icin `erpApi` katmaninda tekrar kullanilabilir helper eklenir.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `lib/erpApi.uploadErpFile`
- `personnelService.uploadPersonnelDocumentFile`
- `PersonnelDetailScreen` form upload + selector UI
- `PersonnelDetailPage` upload callback baglantisi

## Acceptance Criteria
- Belge formundan dosya yuklenebilir.
- Yuklenen dosya referansi (`FILE-xxxx`) otomatik `file_ref` alanina yazilir.
- `file_ref` alani mevcut dosya referanslarini secilebilir listede gosterir.
- Mevcut belge kaydi olusturma/silme akislarinda regresyon olmaz.
- `npm test` ve `npm run build` basarili olur.
