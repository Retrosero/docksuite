# Ön Muhasebe Plan Değişimi Otomatik Normalizasyon - 2026-05-03

## Yapılan
- `shipyard_app.productization.set_tenant_plan` akışına ön muhasebe ayar normalizasyon tetikleyicisi eklendi.
- Aktif tenant site için plan değişimi sonrası `normalize_feature_settings_for_plan` otomatik çağrılır.
- `tenant_site` aktif site değilse normalizasyon güvenli şekilde `skipped` olarak döner.

## Teknik Etki
- Plan değişimi sonrası ayar tutarlılığı için ek manuel çağrı gereksinimi azaldı.
- Farklı tenant_site adlarıyla çalışan yönetim akışlarında yanlış site ayarına dokunma riski engellendi.

## Sonraki Adım
- Tenant geçiş otomasyonu (site context switch) olan yönetim görevlerinde `skipped` durumuna göre sıra tabanlı normalizasyon job'u eklenebilir.
