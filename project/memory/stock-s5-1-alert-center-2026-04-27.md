# Stock S5.1 Memory - 2026-04-27

## Kapsam
- Stok ekranina eylem odakli `Uyari Merkezi` paneli eklendi.
- Kritik, yaklasan ve bilinmeyen risk kalemleri tek noktadan izlenebilir hale getirildi.

## Yapilanlar
- Yeni component:
  - `StockAlertCenterPanel.tsx`
  - ozet kartlar:
    - kritik kalem
    - yaklasan risk
    - bilinmeyen risk
    - stokta 0 veya alti
  - aksiyon listesi:
    - risk seviyesi + dusuk stok onceligiyle siralanmis ilk 8 satir
    - urun kodu, urun adi, grup, mevcut stok, risk etiketi
- Ekran entegrasyonu:
  - `StockScreen` icinde `StockSummaryCards` sonrasi `StockAlertCenterPanel` eklendi.
- Stil:
  - `global.css` icine `stock-panel--alerts` sinifi eklendi.

## Dogrulama
- `npm test` basarili.
- `npm run -s build` basarili.

## Sonraki Adim
- S5.2: Tenant-config uyari esik yonetimi.
