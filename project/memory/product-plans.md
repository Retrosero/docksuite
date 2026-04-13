# Product Plans (Prompt 10)

## Scope
- Productization katmani tenant bazli plan, feature erisim kontrolu, modul toggle ve kullanim takibi icin aktif.
- ERPNext core degistirilmeden, tum implementasyon `shipyard_app` icinde tutuldu.

## Plan System
- Planlar: `basic`, `pro`, `enterprise`
- Plan tanimlari artik kod ici sabit yerine config dosyasindan okunuyor:
  - `project/apps/shipyard_app/shipyard_app/config/productization_defaults.json`
- Varsayilan plan: `default_plan_code` ile config uzerinden belirleniyor.

## Config-Driven Productization
- `shipyard_app.productization` icinde yeni config cozumleme akisi:
  - Dosya tabanli config (`productization_defaults.json`)
  - Hook override (`shipyard_productization`)
  - Site-level override (`site_config.json` icindeki `shipyard_productization`)
- Cozumleme onceligi: site config > hooks > dosya varsayilani.
- Plan katalogu bos ise sistem acik hata verir; sessiz hardcode fallback yok.

## Feature Access Control ve Module Toggle
- `Tenant Product Config` ile tenant-plan baglantisi ve modul override ayarlari yonetiliyor.
- `Tenant Feature Access` ile tenant + feature bazli manuel ac/kapa uygulanabiliyor.
- `HR` ve `Stock` modul durumlari plan varsayimlari veya tenant override ile cozuluyor.

## Usage Tracking
- `Tenant Usage Counter` ile donemsel (`YYYY-MM`) kullanim tutuluyor.
- Izlenen temel metrikler:
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

## Verification Log
- 2026-04-13:
  - `python -m compileall project/apps/shipyard_app/shipyard_app/productization.py` basarili.
  - `python -m compileall project/apps/shipyard_app/shipyard_app/tenant_onboarding.py` basarili.
  - `python -m compileall project/apps/shipyard_app/shipyard_app/fixture_validation.py` basarili.
