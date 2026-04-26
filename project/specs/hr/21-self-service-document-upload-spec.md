# HR Spec 21 - Self Service Document Upload

## Goal
- `Calisan Paneli` uzerinden calisanin kendi belge kaydini olusturabilmesini saglamak.
- Mevcut `Employee Document Record` akisina dosya yukleme ve `file_ref` secici entegre etmek.

## Scope
- Frontend only: `shipyard-portal`
- Route: `/calisan-paneli`
- Feature: `src/features/hr-self-service`
- Data source:
  - `POST /api/method/upload_file`
  - `POST /api/method/shipyard_app.personnel_api.upsert_employee_document_record`
  - `GET /api/resource/Employee Document Record`

## UX
- Belgeler panelinde iki bolum:
  - Son belge kayitlari (dosya linki ile)
  - Yeni belge kaydi formu
- Form alanlari:
  - belge turu
  - dosya ref (datalist secici)
  - belge tarihi / gecerlilik bitis
  - durum
  - zorunlu belge
  - not
- Dosya yukleme satiri:
  - dosya sec
  - ozel/public sec
  - dosyayi yukle
- Yukleme basariliysa `file_ref` alani otomatik doldurulur.

## Technical Rules
- ERPNext core degistirilmez.
- Yeni DocType acilmaz.
- Yukleme `upload_file` ile `Employee` kaydina bagli yapilir.
- Self-service mutasyonlari mevcut `personnel_api.upsert_employee_document_record` endpointini kullanir.
- Session -> Employee eslesmesi yoksa mutasyon fail-safe hata mesaji ile durur.
- Tenant ozel hardcode akis yazilmaz.

## Component Plan
- `hrSelfServiceService`:
  - `uploadHrSelfServiceDocumentFile`
  - `upsertHrSelfServiceDocumentRecord`
  - `recentDocuments` + `fileRefOptions` mapping
- `useHrSelfServiceData`:
  - upload/save mutation state ve message yonetimi
- `HrSelfServiceScreen`:
  - belge formu + yukleme UI
  - action error/success geri bildirimi

## Acceptance Criteria
- Calisan panelinden dosya yuklenebilmeli.
- Yuklenen dosyanin `file_ref` degeri forma otomatik yazilmali.
- Belge kaydi formundan `Employee Document Record` olusturulmali.
- Son belge listesi ve dosya linkleri panelde gorunmeli.
- `npm test` ve `npm run build` basarili olmali.
