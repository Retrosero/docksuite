# Stock S1.2 Memory - 2026-04-26

## Kapsam
- Stok ekranina depo dagilim kartlari eklendi.
- Ozet metrikler toplam stok ve aktif depo sayisi ile genisletildi.

## Yapilanlar
- `StockData` ve `StockSummary` tipleri genisletildi:
  - `warehouseDistribution`
  - `totalWarehouses`
  - `totalStockQtyLabel`
- `stockService.ts` icinde:
  - `Bin` sorgusuna `warehouse` alani eklendi.
  - gorunen stok kayitlarina gore depo bazli dagilim agregasyonu eklendi.
  - depo bazli item sayisi, kritik item sayisi, toplam qty ve pay yuzdesi hesaplandi.
  - yeni ozet metrik hesaplamasi eklendi.
- UI:
  - yeni `StockWarehouseCards` component'i eklendi.
  - `StockSummaryCards` iki yeni metrikle guncellendi.
  - `StockScreen` uzerinde depo dagilim kartlari ozetin altina yerlestirildi.
  - `global.css` icinde depo kartlari ve responsive grid stilleri eklendi.

## Dogrulama
- `npm test` basarili.
- `npm run build` basarili.

## Sonraki Adim
- S1.3: kritik stok risk hesap mantigini ayrik utility modulu haline getirip test kapsamiyla sabitlemek.
