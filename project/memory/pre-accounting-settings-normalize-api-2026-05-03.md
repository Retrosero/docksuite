# Ön Muhasebe Ayar Normalizasyon API - 2026-05-03

## Yapılan
- `shipyard_app.pre_accounting_api.normalize_feature_settings_for_plan` endpoint'i eklendi.
- Endpoint yalnızca `System Manager` rolü ile çağrılabilir.
- Mevcut tenant ayarlarını aktif plana göre normalize eder.
- Değişiklik varsa veriyi kalıcı olarak günceller ve değişen anahtarları döner.

## Teknik Etki
- Plan değişikliği sonrası eski tenant ayarları tek çağrıyla temizlenebilir.
- Okuma sırasında uygulanan plan filtresi artık istenirse kalıcı depoya da uygulanabilir.

## Sonraki Adım
- Tenant plan değişimi akışında bu endpoint otomatik tetiklenebilir.
