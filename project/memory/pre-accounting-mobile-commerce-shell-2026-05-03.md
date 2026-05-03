# Ön Muhasebe Mobil Ticari Kabuk - 2026-05-03

## Kapsam
- Ön muhasebe portalı satış, tahsilat, alış, müşteriler, ürünler, raporlar, ayarlar ve gün sonu akışlarını kapsayacak şekilde genişletildi.
- Arayüz ERPNext Desk temasından bağımsız mobil-first ürün kabuğuna taşındı.
- Türkçe karakterli kullanıcı metinleri kullanılmaya başlandı.

## Yapılanlar
- Yeni modüller:
  - `customers`
  - `products`
  - `purchase-invoice`
  - `end-of-day`
- Route eklemeleri:
  - `/musteriler`
  - `/urunler`
  - `/alis`
  - `/gun-sonu`
- Raporlar satış, alış, tahsilat, ödeme ve net bakiye özetini gösterecek şekilde genişletildi.
- Ayarlar şemasına yeni anahtarlar eklendi:
  - `purchase_invoice.show_supplier_filter`
  - `product.show_stock_badges`
  - `end_of_day.show_cash_difference`
- Mobil CSS düzeni:
  - sabit alt ana menü
  - ikinci seviye yatay menü
  - kart tabanlı kayıt listeleri

## Doğrulama
- `npm test -- --run` başarılı.
- `npm run -s build` başarılı.

## Sonraki Adım
- Satış, tahsilat ve alış formlarını daha küçük mobil hızlı işlem akışlarına bölmek.
- Expo geçişi için ortak domain paketini `shared/domain` altında netleştirmek.
