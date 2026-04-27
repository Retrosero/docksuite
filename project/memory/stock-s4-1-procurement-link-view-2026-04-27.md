# Stock S4.1 Memory - 2026-04-27

## Kapsam
- Stok ekranina procurement baglanti gorunumu eklendi.
- Kritik kalemler icin Material Request, Purchase Order, Purchase Receipt ve Purchase Invoice baglanti ozetleri tek panelde toplandi.

## Yapilanlar
- `stockService.ts`:
  - `fetchStockProcurementLinks` eklendi.
  - `buildStockProcurementLinkSummary` eklendi.
  - Kritik urunler icin procurement kaynaklarindan acik talep/acik siparis/receipt/son fatura hesaplari eklendi.
  - Permission gate:
    - `Material Request`
    - `Purchase Order`
    - `Purchase Receipt`
    - `Purchase Invoice`
  - Child table kaynaklari:
    - `Material Request Item`
    - `Purchase Order Item`
    - `Purchase Receipt Item`
    - `Purchase Invoice Item`
- `types.ts`:
  - `StockProcurementLinkRow`
  - `StockProcurementLinkSummary`
- `useStockData.ts`:
  - `useStockProcurementLinks` hook'u eklendi.
- Yeni UI:
  - `StockProcurementLinkPanel.tsx`
  - Takip edilen kritik urun, acik talep, acik siparis, toplam receipt metrik kartlari
  - Urun bazli procurement baglanti tablosu
- Ekran entegrasyonu:
  - `StockScreen` icine procurement paneli eklendi.
  - Material Request / Transfer / Reconciliation create sonrasi procurement paneli refresh baglandi.
- Stil:
  - `global.css` icine `stock-panel--procurement` sinifi eklendi.
- Test:
  - `stockService.spec.ts` icine `buildStockProcurementLinkSummary` testi eklendi.

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts` basarili.
- `npm test` basarili.
- `npm run -s build` basarili.

## Sonraki Adim
- S4.2: Stock KPI ve rapor paneli.
