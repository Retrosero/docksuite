# On Muhasebe - Ortak Form Validasyon Refactor (2026-05-02)

## Kapsam
Satis, tahsilat ve gider ekranlarindaki tekrar eden form validasyonlari ortak utility katmanina tasindi.

## Yapilanlar
- Yeni ortak dosya:
  - `shared/utils/formValidation.ts`
- Eklenen fonksiyonlar:
  - `validateSalesInvoiceForm`
  - `validateCollectionForm`
  - `validateExpenseInvoiceForm`
  - `validateSupplierPaymentForm`
- Ekran guncellemeleri:
  - `SalesInvoiceScreen` inline kontrol yerine ortak validasyon kullaniyor
  - `CollectionScreen` inline kontrol yerine ortak validasyon kullaniyor
  - `ExpenseScreen` iki form icin ortak validasyon kullaniyor

## Sonuc
- Validasyon kurallari tek noktada toplandi.
- Kod tekrari azaldi.
- Mesajlar ve davranislar tutarli hale geldi.

## Dogrulama
- `npm run build` basarili.
