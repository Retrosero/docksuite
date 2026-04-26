# HR Self Service Document Upload - 2026-04-26

## Scope
- `Calisan Paneli` icindeki belgeler bolumu, sadece risk listesi olmaktan cikartilip
  belge kaydi olusturma akisiyla genisletildi.
- Self-service tarafta dosya yukleme + `file_ref` secici aktif edildi.

## Implemented
- `src/features/hr-self-service/types.ts`
  - belge modeli `fileRef`, `fileName`, `fileUrl`, `visibility`, `issueDate` ile genisletildi.
  - `fileRefOptions` ve belge kayit input tipi eklendi.
- `src/features/hr-self-service/services/hrSelfServiceService.ts`
  - `uploadHrSelfServiceDocumentFile` eklendi.
  - `upsertHrSelfServiceDocumentRecord` eklendi.
  - `Employee Document Record` sorgusu fallback field-set ile guclendirildi.
  - `recentDocuments` ve `fileRefOptions` mapping eklendi.
- `src/features/hr-self-service/hooks/useHrSelfServiceData.ts`
  - belge yukleme/kaydetme mutasyon state'leri eklendi.
  - action error/success mesaji + refresh tetikleme eklendi.
- `src/features/hr-self-service/components/HrSelfServiceScreen.tsx`
  - belge listesi dosya linkleriyle guncellendi.
  - yeni belge kaydi formu eklendi.
  - dosya yukleme satiri ve `Dosyayi Yukle` aksiyonu eklendi.
- `src/styles/global.css`
  - self-service belge formu ve upload satiri stilleri eklendi.

## Technical Notes
- Upload endpoint: `/method/upload_file`
- Record endpoint: `/method/shipyard_app.personnel_api.upsert_employee_document_record`
- Session employee cozumu:
  - `frappe.auth.get_logged_user`
  - `Employee.user_id` eslesmesi

## Verification
- `npm test` basarili
- `npm run build` basarili
