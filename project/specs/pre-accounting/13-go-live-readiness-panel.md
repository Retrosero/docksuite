# Ön Muhasebe Faz 16 - Canlı Kullanım Kontrol Paneli

## Amaç
Canlı kullanıma geçmeden önce tenant ayarları ve kritik ön muhasebe özellikleri için sade bir hazırlık kontrolü sunmak.

## Kapsam
- Ayarlar ekranında `Canlı Kullanım Kontrolü` paneli.
- Satış, kasa/banka, rapor export ve plan uygunluğu kontrolleri.
- Eksik kontrolleri mobil uyumlu kısa liste olarak gösterme.

## Veri Kaynakları
- Tenant config
- Feature settings

## Kabul Kriterleri
- ERPNext core değiştirilmez.
- Kontroller tenant ayarlarından türetilir, sabit firma verisi kullanılmaz.
- Unit ve Playwright smoke kapsamı vardır.
- Test, e2e ve build başarılıdır.
