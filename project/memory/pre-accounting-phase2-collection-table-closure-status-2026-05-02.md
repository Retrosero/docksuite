# On Muhasebe Faz 2 - Tahsilat Tablosu Fatura Kapanis Durumu (2026-05-02)

## Kapsam
Tahsilat listesine fatura bilgisi ve kapanis durumu kolonu eklendi.

## Yapilanlar
- `PaymentEntryItem` genisletildi:
  - `reference_invoice`
  - `closure_status`
- `collectionService.fetchPaymentEntries` guncellendi:
  - `Payment Entry` listesi alindiktan sonra ilgili `Payment Entry Reference` satirlari cekildi
  - `parent` bazli map ile tahsilat-fatura bagi kuruldu
  - kapanis durumu hesaplandi:
    - `Tam Kapandi` (kalan 0)
    - `Kismi Tahsilat` (kalan > 0)
    - referans yoksa `-`
- `CollectionScreen` tablosu guncellendi:
  - yeni kolonlar:
    - `Fatura`
    - `Kapanis Durumu`

## Dogrulama
- `npm run build` basarili.

## Sonraki Adim
Tahsilat tablosuna filtreler ekleyerek `Tam Kapandi/Kismi` ve belirli fatura no bazli hizli filtreleme saglamak.
