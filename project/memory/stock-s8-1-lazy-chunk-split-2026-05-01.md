# Stock S8.1 Memory - 2026-05-01

## Kapsam
- Stok ekraninda detay paneller lazy-load olacak sekilde ayrildi.

## Yapilanlar
- `StockScreen` icinde detay panel importlari `React.lazy` + `Suspense` ile donusturuldu:
  - `StockReconciliationAnalysisPanel`
  - `StockProcurementLinkPanel`
  - `StockProcurementWorkflowPanel`
  - `StockAdvancedReportPanel`
  - `StockKpiReportPanel`
  - `StockAuditSummaryPanel`
  - `StockRolloutChecklistPanel`
- Detay paneller acildiginda tek seferlik chunk yuklenir; ilk acilis daha hafif kalir.

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts` basarili (11/11).
- `npm run -s build` basarili.
- Build cikisinda detay paneller ayri chunk dosyalari olarak olustu:
  - `StockKpiReportPanel-*.js`
  - `StockRolloutChecklistPanel-*.js`
  - `StockProcurementLinkPanel-*.js`
  - `StockAuditSummaryPanel-*.js`
  - `StockAdvancedReportPanel-*.js`
  - `StockReconciliationAnalysisPanel-*.js`
  - `StockProcurementWorkflowPanel-*.js`

## Sonraki Adim
- `S8.2`: performans olcum metrik paneli.
