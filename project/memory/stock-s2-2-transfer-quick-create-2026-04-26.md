# Stock S2.2 Memory - 2026-04-26

## Kapsam
- Stok ekranina `Stock Entry` transfer quick-create akisi eklendi.
- Kart ve tablo satirindan secili urunle transfer baslatma destegi verildi.

## Yapilanlar
- `stockService.ts`:
  - `buildStockTransferDoc`
  - `fetchStockTransferCreateOptions`
  - `createStockTransferEntry`
  - ortak depo listesi icin `fetchSelectableWarehouses`
- `types.ts`:
  - `StockTransferCreateInput`
  - `StockTransferCreateOptions`
- Yeni UI:
  - `StockTransferQuickCreate.tsx`
  - urun, miktar, transfer tarihi, kaynak/hedef depo, not alanlari
  - kaynak/hedef ayni depo kontrolu
  - basari/hata durum mesajlari
- Liste aksiyonlari:
  - `StockCardList` ve `StockTable` icine `Transfer Ac` eklendi.
  - `StockScreen` icinde panel entegrasyonu yapildi.
- Test:
  - `stockService.spec.ts` ile stock transfer doc builder dogrulandi.

## Dogrulama
- `npm test` basarili.
- `npm run build` basarili.

## Sonraki Adim
- S2.3: request/transfer durum rozetleri ve hata yonetimi.
