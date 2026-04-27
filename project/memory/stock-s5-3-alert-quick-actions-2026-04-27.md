# Stock S5.3 Memory - 2026-04-27

## Kapsam
- Uyari Merkezi paneline hizli aksiyon butonlari eklendi.
- Riskli satirdan tek tikla talep/transfer olusturma akisi tetiklenebilir hale geldi.

## Yapilanlar
- `StockAlertCenterPanel.tsx`:
  - Yeni props:
    - `onQuickRequest(itemCode)`
    - `onQuickTransfer(itemCode)`
  - Aksiyon tablosuna `Islem` sutunu eklendi.
  - Her satira:
    - `Talep Olustur`
    - `Transfer Olustur`
    butonlari eklendi.
- `StockScreen.tsx`:
  - Uyari panelinden gelen aksiyonlar `selectedItemCode` state'ine baglandi.
  - Böylece mevcut `StockMaterialRequestQuickCreate` ve `StockTransferQuickCreate` formlari secili urunle hizli aciliyor.

## Dogrulama
- `npm test` basarili.
- `npm run -s build` basarili.

## Sonraki Adim
- S6: stok fazi yeni kapsam plani (alarm otomasyonu / aksiyon workflow / raporlama derinlestirme).
