# Stock S1.1 Memory - 2026-04-26

## Kapsam
- Stock service katmaninda visibility hardening tamamlandi.
- Hedef: farkli tenant ve rol kombinasyonlarinda sayfanin fail-safe acilmasi.

## Yapilanlar
- `stockService.ts` icinde `canReadDoctype` ile `Item`, `Bin`, `Item Group`, `UOM` icin permission gate eklendi.
- `Operational Settings` icinden `stock_list_page_size` yaninda `dashboard_critical_stock_limit` okuma/caching eklendi.
- Item sorgusu fallback field stratejisi eklendi:
  - tam field set
  - `barcode` olmadan
  - `custom_warehouse_aisle` olmadan
  - `is_critical_stock` olmadan
  - minimal set (`name`, `item_code`, `item_name`, `item_group`)
- `is_critical_stock` okunamazsa qty-based kritik stok turetme eklendi.
- `criticalOnly` filtresi client-side olarak da garantilendi.

## Dogrulama
- `npm test` basarili.
- `npm run build` basarili.

## Sonraki Adim
- S1.2: depo dagilim kartlari ve ozet metriklerini stock dashboard UI'a eklemek.
