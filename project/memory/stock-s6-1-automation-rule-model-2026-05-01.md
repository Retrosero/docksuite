# Stock S6.1 Memory - 2026-05-01

## Neden Bu Adim
- S1-S5 tamamlandigi icin yeni faz gecisi gerekiyordu.
- S5 kapanis notlarinda S6 icin net ihtiyac: alarm otomasyonu, aksiyon workflow ve raporlama derinlestirme.
- Faz kapisi kuralina gore once S6.1 modelleme tamamlanmali.

## S6.1 Kapsam
- Alert otomasyonunda event->aksiyon eslemesini tanimlayan kural modeli.
- Tenant bazli config alanlari:
  - otomasyon acik/kapali
  - minimum risk seviyesi
  - cooldown dakika
  - hedef aksiyon tipi (talep/transfer/bildirim)
- ERPNext core degisimi olmadan custom app icinde konumlandirma.

## Kabul Kriterleri (S6.1)
- Kural modeli dokumante ve tracker'da `S6.1` durumu takip ediliyor.
- Tenant-config yaklasimi net ve hardcode tenant davranisi yok.
- Sonraki adim olan `S6.2` icin bagimliliklar acik.

## Sonraki Uygulama Adimi
- S6.1 implementasyonu icin once veri modeli karari:
  - custom field ile mevcut ayar genisletme mi
  - yoksa yeni doctype ile kural satiri modelleme mi

## Uygulama Karari ve Sonuc
- Karar: S6.1 icin yeni doctype yerine `Tenant Settings` uzerinde custom field genisletmesi secildi.
- Gerekce:
  - mevcut operasyon ayarlari zaten `Tenant Settings` uzerinden yonetiliyor
  - tenant bazli davranis tek noktada kaldi
  - minimum degisiklikle S6.2'ye baglanabilecek API zemini olustu

## Tamamlanan Teknik Isler
- Backend:
  - `shipyard_app.platform.api` icine yeni tenant ayar alanlari eklendi:
    - `shipyard_stock_alert_automation_enabled`
    - `shipyard_stock_alert_min_risk_level`
    - `shipyard_stock_alert_cooldown_minutes`
    - `shipyard_stock_alert_default_action`
  - `get_operational_settings` / `save_operational_settings` bu alanlari okuyup kaydedecek sekilde genisletildi.
  - Yeni endpoint: `resolve_stock_alert_automation_decision`
    - girdi: risk seviyesi + son aksiyon dakikasi
    - cikti: tetiklenmeli mi + onerilen aksiyon
- Frontend:
  - Tenant Ayarlari ekranina S6.1 alanlari eklendi.
  - Service katmani yeni alanlari API ile birlikte map edecek sekilde guncellendi.

## Dogrulama
- `python -m compileall project/apps/shipyard_app/shipyard_app/platform/api.py` basarili.
- `npm run -s build` basarili.

## Durum
- `S6.1` tamamlandi.
- Sonraki adim: `S6.2` procurement action workflow paneli.
