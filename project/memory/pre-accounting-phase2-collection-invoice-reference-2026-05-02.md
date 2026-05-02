# On Muhasebe Faz 2 - Tahsilat Fatura Referans Baglanti (2026-05-02)

## Kapsam
Tahsilat ekranina musteriye gore acik fatura secimi eklendi ve olusturulan `Payment Entry` kaydina `Sales Invoice` referansi baglandi.

## Yapilanlar
- `collections` tipi genisletildi:
  - `PaymentEntryForm.referenceInvoice`
  - `OpenSalesInvoiceItem`
- `collectionService`:
  - `fetchOpenSalesInvoices(customer)` eklendi
  - `createCollectionEntry` icinde `references` satiri eklendi:
    - `reference_doctype = Sales Invoice`
    - `reference_name = secilen fatura`
    - `allocated_amount = tahsilat tutari`
- `useCollectionData`:
  - `openInvoices` state eklendi
  - `loadOpenInvoices(customer)` eklendi
- `CollectionScreen`:
  - Musteri secilince acik faturalar yukleniyor
  - `Acik Fatura` select alani eklendi
  - Fatura secimi zorunlu hale getirildi
  - Musteriye ait acik fatura yoksa bilgilendirme mesaji eklendi

## Dogrulama
- `npm run build` basarili.

## Sonraki Adim
Tahsilat formunda secilen faturaninin kalan borcuna gore otomatik tutar onerisi ve tahsilat tutari validasyonu eklemek.
