# Stock S8.3 - Operational Export Packaging (2026-05-01)

## Kapsam
- Stok ekranindaki ileri analiz panellerinden operasyonel raporlarin CSV olarak alinabilmesi.
- Export akisinda tenant-safe satir limiti uygulanmasi.

## Yapilanlar
- `StockExportPanel` eklendi:
  - Urun listesi CSV
  - Reconciliation CSV
  - Procurement CSV
  - KPI trend CSV
  - Audit CSV
  - Ileri risk drill-down CSV
- Tum export aksiyonlarinda ortak CSV indirici yardimcisi kullanildi (`downloadCsv`).
- UTF-8 BOM ile Turkce karakter uyumlu dosya indirme davranisi saglandi.
- Her export listesi icin `EXPORT_ROW_LIMIT = 500` siniri uygulandi.
- `StockScreen` icinde panel lazy detay akisina baglandi.
- Ileri risk exportu icin `buildStockAdvancedReportSummary` sonucu `advancedReport` olarak panele aktarildi.

## Multi-tenant / SaaS Notlari
- Export satir limiti sabit ve guvenli tutuldu, tek tenant'a ozel kural eklenmedi.
- Veri sadece o anki tenant sorgu sonucundan uretildi; ek veri kopyasi tutulmadi.

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts` gecti.
- `npm run -s build` gecti.

## Etkilenen Dosyalar
- `project/frontend/shipyard-portal/src/features/stock/components/StockExportPanel.tsx`
- `project/frontend/shipyard-portal/src/features/stock/components/StockScreen.tsx`
- `project/specs/stock/00-stock-advanced-product-spec.md`
- `project/memory/stock-project-tracker.md`
