# Stock S7.2 Memory - 2026-05-01

## Kapsam
- KPI ve procurement ozet sorgularinda tenant-safe cache + limit stratejisi uygulandi.

## Yapilanlar
- `stockService.ts`:
  - Yeni limit sabitleri:
    - `PROCUREMENT_TRACKED_ITEM_LIMIT`
    - `PROCUREMENT_ITEM_ROW_LIMIT`
    - `KPI_ITEM_CODE_LIMIT`
  - TTL cache yapisi:
    - `stockProcurementSummaryCache`
    - `stockKpiSummaryCache`
    - varsayilan TTL: `60sn`
  - `fetchStockProcurementLinks` ve `fetchStockKpiSummary`:
    - `forceRefresh` opsiyonu eklendi
    - cache key normalizasyonu eklendi
    - limitli sorgu davranisi netlestirildi
- `useStockData.ts`:
  - refresh tetiginde `forceRefresh` true gecilerek cache bypass uyumu saglandi.

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts` basarili (11/11).
- `npm run -s build` basarili.

## Sonraki Adim
- `S7.3`: rollout/izleme checklist'i (yetki-hata-veri kalitesi kontrol seti).
