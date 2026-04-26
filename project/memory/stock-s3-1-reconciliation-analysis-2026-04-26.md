# Stock S3.1 Memory - 2026-04-26

## Kapsam
- Stok ekranina sayim fark analizi paneli eklendi.
- Stock Reconciliation + Stock Reconciliation Item verisi ile fark ozetleri olusturuldu.

## Yapilanlar
- `stockService.ts`:
  - `fetchStockReconciliationAnalysis` eklendi.
  - `buildStockReconciliationAnalysis` eklendi.
  - Fark hesaplama, durum dagilimi ve yuksek fark satiri analizi service katmanina tasindi.
  - Permission gate: `canReadDoctype("Stock Reconciliation")`.
- `types.ts`:
  - `StockReconciliationAnalysis`
  - `StockReconciliationAnalysisRow`
- `useStockData.ts`:
  - `useStockReconciliationAnalysis` hook'u eklendi.
- Yeni component:
  - `StockReconciliationAnalysisPanel.tsx`
  - ozet kartlari, durum rozetleri ve fark tablosu
  - yenile aksiyonu
- Ekran entegrasyonu:
  - `StockScreen` icine panel eklendi.
  - Material Request / Transfer olusturma sonrasi analiz paneli refresh baglandi.
- Stil:
  - reconciliation panel icin yeni CSS siniflari eklendi.

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts` basarili.
- `npm test` basarili.
- `npm run -s build` basarili.

## Sonraki Adim
- S3.2: Stock Reconciliation olusturma quick-create akisi.
