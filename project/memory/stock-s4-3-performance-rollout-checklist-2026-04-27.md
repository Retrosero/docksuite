# Stock S4.3 Memory - 2026-04-27

## Kapsam
- Stock servis katmaninda sorgu yukunu azaltan performans tuning yapildi.
- Rollout checklist olusturularak S4 kapanis kriterleri kayda alindi.

## Performans Tuning
- `stockService.ts` icinde procurement baglanti sorgulari optimize edildi:
  - Once child table'dan ilgili parent id'ler toplaniyor.
  - Parent doc sorgulari tum tablo yerine yalnizca ilgili `name` listesiyle cekiliyor.
  - Bu sayede gereksiz `Material Request` / `Purchase Order` / `Purchase Receipt` / `Purchase Invoice` taramasi azaltildi.
- KPI sorgulari optimize edildi:
  - `Bin` sorgusunda `valuation_rate` alan fallback stratejisi eklendi (alan izinli degilse sade alan setine donus).
  - `Stock Ledger Entry` trend sorgusu son 30 gun + ekrandaki item kodlari kapsamiyla daraltildi.
  - Trend ve valuation sorgu limitleri item setine gore dinamik cap ile sinirlandi.

## Rollout Checklist
- [x] `npm test -- --run src/features/stock/services/stockService.spec.ts`
- [x] `npm test`
- [x] `npm run -s build`
- [x] Stock S1-S4 tracker guncellemeleri
- [x] Spec durum guncellemesi
- [x] Feature branch commit/push
- [x] `develop` merge + push

## Sonraki Adim
- S5 kapsam karari: stok modulunde yeni faz (ornegin alarms, advanced analytics veya procurement action workflow) planlamasi.
