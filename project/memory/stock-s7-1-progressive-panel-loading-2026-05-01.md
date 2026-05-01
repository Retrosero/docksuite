# Stock S7.1 Memory - 2026-05-01

## Kapsam
- Stok ekrani ilk gorunum performansini iyilestirmek icin panel bazli parcali yukleme uygulandi.

## Yapilanlar
- `useStockData` hook ailesine `enabled` kontrolu eklendi:
  - `useStockReconciliationAnalysis`
  - `useStockAuditSummary`
  - `useStockProcurementLinks`
  - `useStockKpiSummary`
- `StockScreen` icinde yeni akis:
  - ilk acilista temel paneller yuklenir (ozet, alert, quick-create)
  - detay paneller (`reconciliation`, `procurement`, `kpi`, `audit`, `advanced report`) butonla aktive edilir
- Beklenen sonuc:
  - ilk acilista daha az API cagrisi
  - ilk render suresinde iyilesme

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts` basarili (11/11).
- `npm run -s build` basarili.

## Sonraki Adim
- `S7.2`: KPI/ileri rapor icin cache + sorgu limit stratejisi.
