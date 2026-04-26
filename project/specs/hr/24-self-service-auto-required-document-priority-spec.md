# HR Spec 24 - Self Service Auto Required Document Priority

## Goal
- Calisan paneli belge formunda zorunlu belge tiplerini onceliklendirip kullaniciya ilk eksik belgeyi otomatik onerme.
- Belge turu seciminde `Zorunlu Belge` checkbox'ini otomatik isaretlemek.

## Scope
- Frontend only: `shipyard-portal`
- Feature: `src/features/hr-self-service`

## UX
- Belge turu datalist sirası:
  - Eksik zorunlu belge tipleri
  - Mevcut zorunlu belge tipleri
  - Diger mevcut belge tipleri
- Form ilk acildiginda ilk oncelikli belge tipi otomatik secilir.
- Belge turu degisince zorunlu tiplerde `Zorunlu Belge` checkbox'i otomatik acik gelir.
- Formda eksik zorunlu belge listesi bilgi notu gosterilir.

## Technical Rules
- ERPNext core degistirilmez.
- Yeni endpoint veya DocType acilmaz.
- Mevcut `requiredDocumentTypes` + `recentDocuments` verileri ile client-side oncelik hesaplanir.
- Form davranisi fail-safe olmalidir (data yoksa mevcut varsayilan akisa doner).

## Acceptance Criteria
- Eksik zorunlu belgeler listelenir ve oncelikli onerilir.
- Auto-required isaretleme belge tipi secimiyle dogru calisir.
- Kayit sonrasi bir sonraki oncelikli tip otomatik secilir.
- `npm test` ve `npm run build` basarili olur.
