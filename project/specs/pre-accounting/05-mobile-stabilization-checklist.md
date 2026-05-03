# Ön Muhasebe Faz 8 - Mobil Stabilizasyon Checklist

## Amaç
Mobil ticari uygulama kabuğunu yeni geliştirmelere geçmeden önce regresyona karşı korumak.

## Otomatik Kontroller
- Zorunlu route omurgası korunur:
  - Genel Bakış
  - Cari
  - Müşteriler
  - Ürünler
  - Satış
  - Tahsilat
  - Alış
  - Gider
  - Kasa/Banka
  - Stok
  - Raporlar
  - Gün Sonu
  - Ayarlar
- Route path değerleri benzersizdir.
- Bilinmeyen route Genel Bakış ekranına düşer.
- Tenant kontrollü feature setting anahtarları eksilmez.
- Tüm feature setting varsayılanları boolean değer taşır.

## Manuel Mobil Smoke
Her kapanıştan önce şu görünüm genişlikleri kontrol edilir:
- 360px
- 390px
- 768px
- masaüstü genişliği

Kontrol akışları:
1. Alt ana menü yatay taşmadan kullanılabilir.
2. İkinci seviye menü kaydırılabilir ve içerik üstüne binmez.
3. Satış hızlı akışı `Cari ve ürün` -> `Tutar` adımlarıyla ilerler.
4. Tahsilat hızlı akışı `Fatura seç` -> `Ödeme al` adımlarıyla ilerler.
5. Gider ekranında `Alış Faturası` ve `Tedarikçi Ödemesi` segmentleri çalışır.
6. Kart listeleri dar ekranda tek kolon görünür.
7. Boş, hata ve yükleniyor mesajları Türkçe kalır.

## Kapanış Komutları
```bash
cd project/frontend/pre-accounting-portal
npm test -- --run
npm run -s build
```

## Sonraki İyileştirme
Playwright eklendiğinde bu checklist ekran görüntüsü ve viewport testlerine taşınmalıdır.
