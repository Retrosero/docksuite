# Stock S10.2 - Alert Action Event Model (2026-05-01)

## Kapsam
- Alarm aksiyonlarinin tetikleyici, aksiyon ve sonuc bilgisiyle izlenebilir event modeline alinmasi.

## Yapilanlar
- Yeni tipler eklendi:
  - `StockAlertActionEventRow`
  - `StockAlertActionEventSummary`
- Service katmaninda yeni ozetleyici eklendi:
  - `buildStockAlertActionEventSummary(...)`
- Yeni panel eklendi:
  - `StockAlertActionEventPanel`
  - Trigger/Aksiyon/Sonuc/Zaman gorunumu
  - Basarili/Uyari/Kritik event sayilari
- `StockScreen` icinde lazy-load detay panel akisine entegre edildi.
- Unit test eklendi (`stockService.spec.ts`):
  - event ozeti olusumu ve sayac tutarliligi dogrulandi.

## Etkilenen Dosyalar
- `project/frontend/shipyard-portal/src/features/stock/types.ts`
- `project/frontend/shipyard-portal/src/features/stock/services/stockService.ts`
- `project/frontend/shipyard-portal/src/features/stock/services/stockService.spec.ts`
- `project/frontend/shipyard-portal/src/features/stock/components/StockAlertActionEventPanel.tsx`
- `project/frontend/shipyard-portal/src/features/stock/components/StockScreen.tsx`

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts` gecti.
- `npm run -s build` gecti.

## Durum
- `S10.2` tamamlandi.
- Sonraki adim: `S10.3` tenant karsilastirmali denetim/raporlama genisletmesi.
