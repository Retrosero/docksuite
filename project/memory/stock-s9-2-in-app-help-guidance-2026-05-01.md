# Stock S9.2 - In-App Help & Guidance (2026-05-01)

## Kapsam
- StockScreen icinde yeni personel ve operasyon kullanicilari icin kisa kullanim rehberi.
- Hata durumunda ilgili smoke dokumanina yonlendirme.

## Yapilanlar
- `StockScreen` icine "Kisa Kullanim Rehberi" paneli eklendi.
- Rol bazli hizli kullanim notlari eklendi:
  - Depo sorumlusu
  - Formen
  - Yonetici
- Rehber panelinde referans dokuman yolu gosterildi:
  - `project/docs/erpnext/project-usage/stock-rol-bazli-smoke-checklist.md`
- Genel veri hatasi veya detay panel hatasi oldugunda kullaniciyi smoke checklist'e yonlendiren hata notlari eklendi.
- Rehber paneli icin stil siniflari eklendi (`stock-help-list`, `stock-help-docline`).

## Etkilenen Dosyalar
- `project/frontend/shipyard-portal/src/features/stock/components/StockScreen.tsx`
- `project/frontend/shipyard-portal/src/styles/global.css`

## Dogrulama
- `npm test -- --run src/features/stock/services/stockService.spec.ts`
- `npm run -s build`

## Durum
- `S9.2` tamamlandi.
- Sonraki adim: `S9.3` canliya gecis operasyon paketi.
