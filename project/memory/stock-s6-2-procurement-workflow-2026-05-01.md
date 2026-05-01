# Stock S6.2 Memory - 2026-05-01

## Kapsam
- Stok ekranina procurement aksiyon workflow paneli eklendi.
- AmaÃ§: kritik kalemlerde talep -> siparis -> teslimat -> fatura gecisini tek tabloda izlemek.

## Yapilanlar
- Service:
  - `buildStockProcurementWorkflowSummary` eklendi.
  - Procurement satirlari faz bazli siniflandi:
    - `Talep Bekliyor`
    - `Talep Acik`
    - `Siparis Acik`
    - `Teslim Alindi`
    - `Faturalandi`
  - Her faz icin aksiyon onerisi uretiliyor.
- UI:
  - `StockProcurementWorkflowPanel` eklendi.
  - Panelde faz rozetleri, adet ozetleri ve satir bazli hizli `Talep` / `Transfer` aksiyonlari var.
  - Aksiyonlar mevcut quick-create formlarini yeniden kullaniyor.
- Test:
  - `stockService.spec.ts` icine workflow ozeti icin yeni unit test eklendi.

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts` basarili (10/10).
- `npm run -s build` basarili.

## Sonraki Adim
- `S6.3`: ileri raporlama paneli (yaslanma, hareket sapmasi, acik risk drill-down).
