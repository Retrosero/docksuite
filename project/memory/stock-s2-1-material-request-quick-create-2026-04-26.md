# Stock S2.1 Memory - 2026-04-26

## Kapsam
- Stok ekranina Material Request quick-create akisi eklendi.
- Kart ve tablo satirindan secilen urunle hizli talep acma desteklendi.

## Yapilanlar
- `stockService.ts`:
  - `fetchStockMaterialRequestCreateOptions` eklendi.
  - `createStockMaterialRequest` eklendi.
  - `buildMaterialRequestDoc` eklendi.
  - Material Request olusturma `frappe.client.insert` uzerinden JSON `doc` ile yapildi.
- `types.ts`:
  - `StockMaterialRequestCreateInput`
  - `StockMaterialRequestCreateOptions`
- Yeni component:
  - `StockMaterialRequestQuickCreate.tsx`
  - urun, miktar, ihtiyac tarihi, hedef depo, not alanlari
  - basari/hata durum mesajlari
- Mevcut listeler:
  - `StockCardList` ve `StockTable` icine `Talep Ac` aksiyonu eklendi.
  - `StockScreen` icinde secili urun state'i ve quick-create panel entegrasyonu yapildi.
- Stil:
  - quick-create panel/form/aksiyon siniflari eklendi.

## Dogrulama
- `npm test` basarili.
- `npm run build` basarili.

## Sonraki Adim
- S2.2: Stock Entry transfer quick-create akisini eklemek.
