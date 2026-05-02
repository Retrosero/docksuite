# On Muhasebe Faz 2 - Tahsilat Tablosu Hizli Filtreler (2026-05-02)

## Kapsam
Tahsilat tablosuna `Kapanis Durumu`, `Fatura No` ve `Cari` bazli hizli filtreleme eklendi.

## Yapilanlar
- `CollectionScreen` icinde yeni filtre state'leri eklendi:
  - `closureFilter`
  - `invoiceSearch`
  - `partySearch`
- `entries` listesi client-side filtreleme ile `filteredEntries` uzerinden render edilmeye baslandi.
- Filtre UI eklendi:
  - kapanis durumu select (Hepsi / Tam Kapandi / Kismi Tahsilat)
  - fatura no metin arama
  - cari metin arama
- Bos durum mesaji filtre sonucuna gore guncellendi.

## Dogrulama
- `npm run build` basarili.

## Sonraki Adim
Filtre secimlerini sayfa yenilense de korumak icin query-string veya localStorage senkronu eklemek.
