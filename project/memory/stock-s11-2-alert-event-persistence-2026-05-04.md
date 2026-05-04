# Stock S11.2 - Alert Action Event Persistence (2026-05-04)

## Kapsam
- Alarm aksiyon eventlerinin gecici frontend ozetinden cikarilip tenant site icinde kalici ERP kaydina alinmasi.

## Yapilanlar
- Yeni custom DocType bootstrap akisi eklendi:
  - `Stock Alert Action Event`
- Backend endpointleri eklendi:
  - `shipyard_app.platform.api.record_stock_alert_action_events`
  - `shipyard_app.platform.api.get_stock_alert_action_events`
- Frontend stok event paneli:
  - workflow/audit sinyallerinden uretilen eventleri backend'e senkronlar
  - son eventleri kalici ERP kaydindan okur
  - backend erisilemezse gecici ekran ozetini Turkce fail-safe mesajla gostermeye devam eder

## Teknik Karar
- ERPNext core degistirilmedi.
- Event gecmisi tekrar eden operasyon kaydi oldugu icin Custom Field yerine New DocType kullanildi.
- Event kayitlari tenant site/veritabani icinde tutulur; ortak harici tablo veya firma hardcode'u eklenmedi.

## Dogrulama
- `python -m compileall project/apps/shipyard_app/shipyard_app/platform/api.py project/apps/shipyard_app/shipyard_app/tenant_onboarding.py`
- `npm test -- --run src/features/stock/services/stockService.spec.ts`
- `npm run -s build`

## Durum
- `S11.2` tamamlandi.
- Sonraki adim: `S11.3` otomatik incident kurallari ve bildirim.
