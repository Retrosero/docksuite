# Ön Muhasebe Faz 16 - Canlı Kullanım Kontrol Paneli - 2026-05-05

## Kapsam
- Ayarlar ekranına `Canlı Kullanım Kontrolü` paneli eklendi.
- Kontroller feature settings ve tenant planından türetildi.
- Satış hazırlığı, kasa/banka transferleri, rapor CSV export ve plan uygunluğu tek panelde özetlenir.

## Teknik Not
- `buildGoLiveReadinessSummary` service helper olarak eklendi.
- Panel UI içinde API çağrısı yapmaz.
- Grup sırasına `Raporlar` eklendi; yeni rapor export ayarı ayarlar ekranında görünür hale geldi.

## Doğrulama
- `npm test -- --run`
- `npm run test:e2e`
- `npm run -s build`
