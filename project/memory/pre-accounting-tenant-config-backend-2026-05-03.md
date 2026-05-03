# Ön Muhasebe Tenant Config Backend - 2026-05-03

## Yapılan
- `shipyard_app.pre_accounting_api.get_tenant_config` endpoint'i eklendi.
- Endpoint mevcut productization profilinden ERP plan kodunu okuyup ön muhasebe planına map eder.
- Frontend `tenantConfigService` ve `useTenantConfig` ile tenant config'i backend'den yükler hale getirildi.
- Backend `save_feature_setting`, plan dışı bir ayarın açılmasını reddeder hale getirildi.
- Tenant config merge helper'ı için test eklendi.

## Plan Eşlemesi
- `basic` -> `temel`
- `pro` -> `ticari`
- `enterprise` -> `mobil`

## Teknik Karar
- Yeni plan DocType açılmadı; mevcut productization yapısı kullanıldı.
- Frontend offline/dev durumda `DEFAULT_TENANT_CONFIG` ile çalışmaya devam eder.
- Plan dışı ayarların kapatılmasına izin verilir, açılması backend tarafında engellenir.

## Sonraki Adım
- Productization plan feature flag listesine ön muhasebe feature anahtarları eklenebilir.
- Tenant config endpoint'i ileride marka/görünüm ayarlarını da döndürebilir.
