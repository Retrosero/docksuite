# Stock S10.3 - Tenant Comparison Reporting (2026-05-01)

## Kapsam
- Tenant bazli denetim ve raporlama katmanini benchmark karsilastirmasi ile genisletmek.

## Yapilanlar
- Yeni tipler eklendi:
  - `StockTenantComparisonRow`
  - `StockTenantComparisonSummary`
- Service katmanina yeni ozetleyici eklendi:
  - `buildStockTenantComparisonSummary(...)`
  - Trend skoru, incident yogunlugu ve acik risk metriklerini benchmark ile karsilastirir.
- Yeni panel eklendi:
  - `StockTenantComparisonPanel`
  - Tenant/benchmark/fark/durum tablosu
- `StockScreen` icine lazy-load detay panel akisiyla entegre edildi.
- Unit test eklendi (`stockService.spec.ts`):
  - karsilastirma ozetinin metrik satirlarini urettigi dogrulandi.

## Etkilenen Dosyalar
- `project/frontend/shipyard-portal/src/features/stock/types.ts`
- `project/frontend/shipyard-portal/src/features/stock/services/stockService.ts`
- `project/frontend/shipyard-portal/src/features/stock/services/stockService.spec.ts`
- `project/frontend/shipyard-portal/src/features/stock/components/StockTenantComparisonPanel.tsx`
- `project/frontend/shipyard-portal/src/features/stock/components/StockScreen.tsx`

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts` gecti.
- `npm run -s build` gecti.

## Durum
- `S10.3` tamamlandi.
- `S10` fazi kapatildi.
