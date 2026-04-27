# Stock S4.2 Memory - 2026-04-27

## Kapsam
- Stok ekranina KPI ve rapor paneli eklendi.
- Toplam item, kritik item, dusuk stok deger etkisi, depo dagilim lideri ve donemsel hareket trendi tek panelde toplandi.

## Yapilanlar
- `stockService.ts`:
  - `fetchStockKpiSummary` eklendi.
  - `buildStockKpiSummary` eklendi.
  - Veri kaynaklari:
    - `Bin` (`actual_qty`, `valuation_rate`) ile deger etkisi hesaplandi.
    - `Stock Ledger Entry` (`posting_date`, `actual_qty`) ile son 30 gun hareket trendi hesaplandi.
  - Permission gate:
    - `Bin`
    - `Stock Ledger Entry`
- `types.ts`:
  - `StockKpiTrendPoint`
  - `StockKpiSummary`
- `useStockData.ts`:
  - `useStockKpiSummary` hook'u eklendi.
- Yeni UI:
  - `StockKpiReportPanel.tsx`
  - KPI kartlari + son 10 gun hareket trend tablosu
- Ekran entegrasyonu:
  - `StockScreen` icine KPI paneli eklendi.
  - Material Request / Transfer / Reconciliation create sonrasi KPI paneli refresh baglandi.
- Stil:
  - `global.css` icine `stock-panel--kpi` sinifi eklendi.
- Test:
  - `stockService.spec.ts` icine `buildStockKpiSummary` testi eklendi.

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts` basarili.
- `npm test` basarili.
- `npm run -s build` basarili.

## Sonraki Adim
- S4.3: Performans tuning + rollout checklist.
