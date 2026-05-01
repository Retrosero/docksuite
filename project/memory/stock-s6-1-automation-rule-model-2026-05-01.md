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
