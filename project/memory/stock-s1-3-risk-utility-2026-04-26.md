# Stock S1.3 Memory - 2026-04-26

## Kapsam
- Kritik stok risk hesap mantigi service icinden ayrilip utility katmanina tasindi.
- Risk seviyesi semasi netlestirildi: `critical`, `warning`, `normal`, `unknown`.

## Yapilanlar
- Yeni utility: `src/features/stock/services/stockRisk.ts`
  - `resolveStockRisk` fonksiyonu eklendi.
  - Girdi: qty, critical field sinyali, tenant critical limit.
  - Cikti: `isCritical`, `riskLevel`, `tone`.
- `stockService.ts` icindeki risk karari utility'ye baglandi.
- `StockItem` tipine `riskLevel` eklendi.
- UI guncellemesi:
  - Kart ve tabloda `Yaklasan` (warning) ve `Bilinmiyor` rozetleri.
  - warning tone icin yeni stil siniflari.
- Test:
  - `stockRisk.spec.ts` ile 5 senaryo kapsandi.

## Dogrulama
- `npm test` basarili.
- `npm run build` basarili.

## Sonraki Adim
- S2.1: stok ekranindan Material Request quick-create akisini eklemek.
