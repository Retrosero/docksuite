# On Muhasebe Faz 2 - Dashboard ve Cari Canli Veri Entegrasyonu (2026-05-02)

## Kapsam
`pre-accounting-portal` icinde Dashboard ve Cari ekranlari mock veriden ERPNext canli verisine baglandi.

## Yapilanlar
- ERP API katmani genisletildi:
  - `getResourceList` helper eklendi
  - `fields`, `filters`, `order_by`, `limit_page_length` query destegi eklendi
- Dashboard canli veri servisi eklendi:
  - Kaynaklar: `Sales Invoice`, `Purchase Invoice`
  - Metrikler:
    - bugunku satis toplami
    - bekleyen tahsilat
    - bekleyen odeme
    - vadesi gecen alacak
- Cari canli veri servisi eklendi:
  - Kaynaklar: `Customer`, `Supplier`, `GL Entry`
  - Musteri/tedarikci listesi ve bakiye agregasyonu eklendi
- Dashboard/Cari icin hook katmani eklendi:
  - loading + hata durumlari
- Para birimi formatlayici eklendi:
  - `formatTryCurrency`
- UI guncellemeleri:
  - canli veri kartlari/tablo
  - bos liste ve hata mesajlari

## Dogrulama
- `npm run build` basarili.

## Sonraki Adim
Faz 2 devaminda Tahsilat ve Satis Faturalari ekranlarini ERPNext `Payment Entry` ve `Sales Invoice` create/list akislarina baglamak.
