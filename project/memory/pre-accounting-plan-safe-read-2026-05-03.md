# Ön Muhasebe Plan Güvenli Okuma - 2026-05-03

## Yapılan
- `get_feature_settings` yanıtına aktif tenant planı eklendi.
- Plan dışı kalan kayıtlı ayarlar okuma sırasında otomatik olarak `false` dönecek şekilde backend katmanı güncellendi.
- `save_feature_setting` artık mevcut ayar state'ini plan filtrelenmiş haliyle güncelliyor.

## Teknik Etki
- Eski tenantlarda yanlış planla açık kalmış feature flag'ler UI'da aktif görünmez.
- Frontend davranışı ile backend gerçek durumu aynı kaldı.

## Sonraki Adım
- Plan değişikliğinde tenant ayarlarını normalize eden bir yönetim komutu eklenebilir.
