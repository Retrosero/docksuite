# Stock S3.3 Memory - 2026-04-27

## Kapsam
- Stok ekranina audit iz ozet paneli eklendi.
- Material Request, Stock Entry ve Stock Reconciliation kayitlari icin acik/kapali akis ozetleri tek panelde toplandi.

## Yapilanlar
- `stockService.ts`:
  - `fetchStockAuditSummary` eklendi.
  - `buildStockAuditSummary` eklendi.
  - Doctype bazli audit satiri toplama ve fail-safe field fallback akisi eklendi.
  - Acik/kapali durum cozumleme mantigi (`resolveAuditState`) eklendi.
- `types.ts`:
  - `StockAuditEventRow`
  - `StockAuditSummary`
- `useStockData.ts`:
  - `useStockAuditSummary` hook'u eklendi.
- Yeni UI:
  - `StockAuditSummaryPanel.tsx`
  - Toplam kayit, acik akis, kapali akis, farkli islem sahibi metrik kartlari
  - Doctype dagilim rozetleri
  - Son hareketler tablosu (belge, kaynak, tarih, durum, docstatus, sahip, son guncelleme)
- Ekran entegrasyonu:
  - `StockScreen` icine audit paneli eklendi.
  - Material Request / Transfer / Reconciliation olusturma sonrasi audit paneli refresh baglandi.
- Stil:
  - `global.css` icine `stock-panel--audit` ve `stock-audit-status-note` siniflari eklendi.
- Test:
  - `stockService.spec.ts` icine `buildStockAuditSummary` testi eklendi.

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts` basarili.
- `npm test` basarili.
- `npm run -s build` basarili.

## Sonraki Adim
- S4.1: Procurement baglanti gorunumu (PO/PR/PI).
