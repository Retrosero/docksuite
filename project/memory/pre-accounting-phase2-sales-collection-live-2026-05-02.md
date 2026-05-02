# On Muhasebe Faz 2 - Satis ve Tahsilat Canli Akis (2026-05-02)

## Kapsam
`pre-accounting-portal` icinde `Satis Faturalari` ve `Tahsilat` ekranlari ERPNext canli veri kaynaklarina baglandi.

## Yapilanlar
- ERP API katmanina yazma destegi eklendi:
  - `erpPost`
  - `createResource`
- Satis faturasi modulu:
  - `Sales Invoice` listeleme
  - Musteri (`Customer`) secimi
  - Urun (`Item`) secimi
  - Temel fatura olusturma formu
  - Kayit sonrasi liste yenileme
- Tahsilat modulu:
  - `Payment Entry` (payment_type=Receive) listeleme
  - Musteri (`Customer`) secimi
  - Odeme yontemi (`Mode of Payment`) secimi
  - Temel tahsilat kaydi olusturma formu
  - Kayit sonrasi liste yenileme
- UI:
  - loading/error/bos durumlari eklendi
  - form alanlari icin ortak `form-grid` stilleri eklendi

## Teknik Not
- Payment Entry olusturma tarafinda ERPNext'te sirket/hesap ayarlari eksikse backend validasyon hatasi doner.
- Bu durumda kullaniciya Turkce hata mesaji gosteriliyor.

## Dogrulama
- `npm run build` basarili.

## Sonraki Adim
Tahsilat ekranina acik fatura secimi eklenip `Payment Entry Reference` satirlariyla fatura-tahsilat baginin kurulmasi.
