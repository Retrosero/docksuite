# Product Plans (Prompt 10)

## Scope
- Faz 10 (productization) icin tenant bazli plan, feature erisimi, modul toggle ve kullanim takibi katmani eklendi.
- ERPNext core degistirilmeden, tamamen `shipyard_app` custom app icinde uygulandi.

## Added Productization Assets

### New Module
- `shipyard_app.productization`
  - Plan katalogu bootstrap
  - Tenant plan atama
  - Feature flag/erişim kontrolu
  - HR ve stok modul toggle cozumlemesi
  - Kullanim sayaçlari (kullanici + islem)

### New Custom DocTypes
- `Product Plan`
  - Plan tanimi (`basic`, `pro`, `enterprise`)
  - Limit alanlari (`max_users`, `max_transactions_per_month`)
  - Modul toggle varsayimlari (`hr_module_enabled`, `stock_module_enabled`)
  - Varsayilan feature flag listesi (`default_feature_flags_json`)
- `Tenant Product Config`
  - Tenant bazli aktif plan (`plan_code`)
  - Modul override davranisi
  - Feature listesi override davranisi
  - Limit uygulama anahtari
- `Tenant Feature Access`
  - Tenant + feature bazli manuel izin/engelleme kaydi
- `Tenant Usage Counter`
  - Donemsel (`YYYY-MM`) kullanim sayaclari
  - `active_user_count`
  - `transaction_count`
  - `event_breakdown_json`

## APIs
- `shipyard_app.productization.set_tenant_plan`
- `shipyard_app.productization.set_module_toggles`
- `shipyard_app.productization.upsert_feature_access`
- `shipyard_app.productization.get_tenant_product_profile`
- `shipyard_app.productization.is_feature_enabled`
- `shipyard_app.productization.track_usage_event`
- `shipyard_app.productization.get_usage_summary`

## Bootstrap Integration
- `shipyard_app.tenant_onboarding.bootstrap_shipyard_setup` icine `productization.bootstrap_productization()` eklendi.
- Install/migrate akisinda productization katmani otomatik kurulur.

## Fixtures
- Hook fixture DocType listesine eklendi:
  - `Product Plan`
  - `Tenant Product Config`
  - `Tenant Feature Access`
  - `Tenant Usage Counter`

## Multi-tenant/SaaS Notes
- Tenant ozel davranislar kodda hardcode edilmedi; DocType + config kayitlarindan cozuluyor.
- Planlar reusable urun katmani olarak tasarlandi.
- Site bazli izolasyon korunuyor (her tenant kendi site/db).
