# Ön Muhasebe Faz 6 - Mobil Hazırlık ve React Native Akış Spec'i

## Amaç
Web portalda kullanılan domain mantığını React Native uygulamaya taşınabilir hale getirmek.

## Hedef Mimari
Ortak domain katmanı:
- hesaplama ve validasyon fonksiyonları
- para birimi ve durum dönüştürücüleri
- API payload normalizasyonu

Platform katmanı:
- web ekranları (`pre-accounting-portal`)
- mobil ekranlar (gelecek React Native uygulaması)

## Ortak Domain Kuralları
1. Domain fonksiyonları DOM bağımlılığı içermez.
2. Tahsilat, bakiye, kapanış gibi iş kuralları shared fonksiyonlardan geçer.
3. UI bileşenlerinde hesaplama tekrarı yapılmaz.
4. İş kuralları test edilebilir saf fonksiyonlarda tutulur.

## React Native İlk Ekran Akışları
1. Giriş
2. Dashboard
3. Tahsilat Hızlı Kayıt
4. Satış Faturası Hızlı Kayıt
5. Cari Arama
6. Stok Durum Özeti
7. Kasa/Banka Özet

## Faz 6 Çıkış Kriterleri
1. Domain fonksiyonları `shared/utils` altında ayrıştırılmış olmalı.
2. Mobilde kullanılacak ekran akışları yazılı spec olarak tanımlı olmalı.
3. En az tahsilat kapanış hesapları ortak utility ile yönetilmeli.
4. Yeni feature'larda aynı helper katmanı kullanılmalı.
