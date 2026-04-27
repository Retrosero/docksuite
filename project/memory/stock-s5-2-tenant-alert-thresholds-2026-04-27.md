# Stock S5.2 Memory - 2026-04-27

## Kapsam
- Stok risk/uyari esigi tenant-config tabanli hale getirildi.
- Kritik esik uzerindeki uyari araligi artik tenant ayarindan gelen carpanla yonetiliyor.

## Yapilanlar
- Backend (`shipyard_app.platform.api`):
  - Yeni Tenant Settings alani: `shipyard_stock_warning_multiplier`
  - `get_operational_settings` cevabina `stock_warning_multiplier` eklendi.
  - `save_operational_settings` API'sine `stock_warning_multiplier` kaydetme eklendi.
  - sanitize araligi: `1.1` - `5.0`
- Tenant onboarding:
  - `Tenant Settings` bootstrap + extension alan listesine `shipyard_stock_warning_multiplier` eklendi.
- Frontend tenant settings:
  - `OperationalSettingsState` icine `stockWarningMultiplier` eklendi.
  - Tenant ayarlar ekranina `Stok Uyari Carpani` inputu eklendi.
  - `saveOperationalSettings` body'sine `stock_warning_multiplier` eklendi.
- Stock risk engine:
  - `resolveStockRisk` fonksiyonuna `warningMultiplier` parametresi eklendi.
  - `stockService` icinde operational settings'ten `stock_warning_multiplier` cekilip risk hesaplamasina baglandi.

## Dogrulama
- `python -m compileall project/apps/shipyard_app/shipyard_app/platform/api.py project/apps/shipyard_app/shipyard_app/tenant_onboarding.py` basarili.
- `npm test -- --run src/features/stock/services/stockRisk.spec.ts src/features/stock/services/stockService.spec.ts` basarili.
- `npm test` basarili.
- `npm run -s build` basarili.

## Sonraki Adim
- S5.3: Uyari bazli hizli aksiyon akisi (talep/transfer shortcut).
