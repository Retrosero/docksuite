# On Muhasebe Faz 2 - Kismi Tahsilat Kalan Borc Karti ve Durum Etiketi (2026-05-02)

## Kapsam
Tahsilat ekranina secilen fatura icin tahsilat sonrasi kalan borc hesap karti ve durum etiketi eklendi.

## Yapilanlar
- `CollectionScreen`:
  - hesaplanan alanlar eklendi:
    - `remainingAfterCollection`
    - `collectionStatusLabel`
  - gosterim karti eklendi:
    - Mevcut Borc
    - Tahsilat Tutari
    - Tahsilat Sonrasi Kalan
  - durum etiketi eklendi:
    - `Tam Kapandi` (kalan 0 ise)
    - `Kismi Tahsilat` (kalan > 0 ise)
- Stil:
  - `collection-summary-card`
  - `status-pill success/warning`

## Dogrulama
- `npm run build` basarili.

## Sonraki Adim
Tahsilat listesinde fatura bazli kapanis durumunu da tablo kolonu olarak gostermek icin `Payment Entry Reference` verisini okuyup satir bazli ozetlemek.
