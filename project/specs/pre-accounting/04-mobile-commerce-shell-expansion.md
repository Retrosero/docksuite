# Ön Muhasebe Faz - Mobil Ticari Kabuk Genişlemesi

## Kapsam
`pre-accounting-portal` uygulaması ERPNext temasından bağımsız, Türkçe ve mobil-first ticari uygulama kabuğu olarak genişletildi.

## Sayfa Omurgası
- Genel Bakış
- Cari
- Müşteriler
- Ürünler
- Satış
- Tahsilat
- Alış
- Gider ve Ödeme
- Kasa/Banka
- Stok
- Raporlar
- Gün Sonu
- Ayarlar

## ERPNext DocType Eşlemesi
| Sayfa | Kaynak |
|---|---|
| Müşteriler | Customer, GL Entry |
| Ürünler | Item, Bin |
| Alış | Purchase Invoice |
| Gün Sonu | Sales Invoice, Purchase Invoice, Payment Entry |
| Raporlar | Sales Invoice, Purchase Invoice, Payment Entry, GL Entry |

## Uygulama Kararları
1. ERPNext core veya Desk tema dosyaları değiştirilmedi.
2. Yeni sayfalar web frontend içinde feature-based yapı ile eklendi.
3. API çağrıları `services` katmanında tutuldu.
4. UI metinleri Türkçe karakterlerle yazıldı.
5. Mobilde ana navigasyon alt sabit menü gibi çalışacak şekilde düzenlendi.
6. Yeni opsiyonel UI alanları `FeatureSettings` anahtarlarına bağlandı.

## React Native Hazırlık Notu
Yeni domain tipleri ve servisleri DOM bağımlılığı içermez. Expo geçişinde web layout ve HTML elementleri yeniden yazılırken servis ve tip katmanı korunabilir.
