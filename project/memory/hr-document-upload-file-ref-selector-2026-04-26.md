# HR Document Upload and FileRef Selector - 2026-04-26

## Scope
- Personel detay ekranindaki `Yeni belge kaydi` formuna dosya yukleme adimi eklendi.
- `file_ref` alani mevcut `File` kayitlarini secilebilir liste olarak sunacak sekilde guncellendi.

## Implemented
- `lib/erpApi.ts`
  - `uploadErpFile` helper eklendi (multipart/form-data, CSRF ve timeout uyumlu).
- `src/features/personnel/services/personnelService.ts`
  - `uploadPersonnelDocumentFile` eklendi.
  - Belge ozetine `fileRefOptions` eklendi.
- `src/features/personnel/types.ts`
  - `PersonnelDocumentFileRefOptionType` ve summary icinde `fileRefOptions`.
- `src/features/personnel/components/PersonnelDetailScreen.tsx`
  - Dosya secimi + private secimi + `Dosyayi Yukle` aksiyonu eklendi.
  - Yukleme basariliysa `file_ref` input'u otomatik dolduruluyor.
  - `Dosya Ref` icin datalist secici eklendi.
- `src/pages/personnel/PersonnelDetailPage.tsx`
  - Upload callback baglandi.
- `src/styles/global.css`
  - Upload satiri ve responsive stiller eklendi.

## Technical Notes
- Yukleme endpointi: `/method/upload_file`
- Dosya baglama:
  - `attached_to_doctype = Employee`
  - `attached_to_name = employee_id`
- Belge kaydi endpointi degismedi; `upsert_employee_document_record` akisi korunuyor.

## Verification Targets
- `npm test`
- `npm run build`
