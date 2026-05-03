# Ön Muhasebe Kuralları - Mobil Ticari Uygulama Kabuğu

## Amaç
Ön muhasebe portalı ERPNext Desk teması gibi görünmez. Kullanıcıya sade, hızlı, Türkçe ve mobil uygulama hissi veren ayrı bir ürün arayüzü sunulur.

## Zorunlu Sayfa Omurgası
İlk ürün kabuğunda şu sayfalar bulunur:
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

## UI Kuralları
1. Tüm görünür metinler Türkçe karakterlerle yazılır.
2. ERPNext Desk sınıfları, renkleri veya admin tema kalıpları kopyalanmaz.
3. Mobilde ana aksiyonlara tek elle erişim önceliklidir.
4. Liste ekranlarında dar ekranda kart görünümü tercih edilir.
5. Geniş tablo gerekiyorsa yatay kaydırma kontrollü ve taşmasız olmalıdır.
6. Sayfalar component-first ayrılır; page dosyaları sadece orkestrasyon yapar.

## React Native / Expo Hazırlığı
1. API çağrıları component içine yazılmaz.
2. `features/*/services` ve `features/*/types` web DOM bağımlılığı içermez.
3. Hesaplama ve validasyonlar `shared/utils` veya domain service katmanında tutulur.
4. Web'e özel navigasyon ve layout `app/` katmanında izole kalır.
5. Expo'ya taşınacak ekranlarda veri şekli aynı kalacak şekilde tipler korunur.
