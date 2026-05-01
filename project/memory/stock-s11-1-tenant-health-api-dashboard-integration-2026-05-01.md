# Stock S11.1 - Tenant Health API & Dashboard Integration (2026-05-01)

## Kapsam
- Stok operasyon panellerinin tenant saglik metriklerini backend tarafindan tek endpoint ile almasi.

## Yapilanlar
- Backend endpoint eklendi:
  - `shipyard_app.platform.api.get_stock_tenant_health_summary`
  - Dondurdugu alanlar:
    - `critical_stock_count`
    - `active_alert_count`
    - `open_reconciliation_count`
    - `incident_open_count`
    - `incident_last_updated_at`
    - benchmark degerleri
- Frontend service katmanina endpoint istemcisi eklendi:
  - `fetchStockTenantHealthSummary`
- Hook katmani eklendi:
  - `useStockTenantHealthSummary`
- `StockTenantOperationsPanel` backend health verisini oncelikli kullanacak sekilde guncellendi.
- `StockScreen` icinde panel refresh akislarina tenant health refresh baglandi.

## Etkilenen Dosyalar
- `project/apps/shipyard_app/shipyard_app/platform/api.py`
- `project/frontend/shipyard-portal/src/features/stock/types.ts`
- `project/frontend/shipyard-portal/src/features/stock/services/stockService.ts`
- `project/frontend/shipyard-portal/src/features/stock/hooks/useStockData.ts`
- `project/frontend/shipyard-portal/src/features/stock/components/StockTenantOperationsPanel.tsx`
- `project/frontend/shipyard-portal/src/features/stock/components/StockScreen.tsx`

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts`
- `npm run -s build`

## Durum
- `S11.1` tamamlandi.
- Sonraki adim: `S11.2` event persistence modeli.
