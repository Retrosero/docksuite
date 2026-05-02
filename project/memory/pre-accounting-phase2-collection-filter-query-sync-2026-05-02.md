# On Muhasebe Faz 2 - Tahsilat Filtre Query-String Senkronu (2026-05-02)

## Kapsam
Tahsilat tablosu filtreleri URL query-string ile senkronlandi ve paylasilabilir filtreli link destegi eklendi.

## Yapilanlar
- `CollectionScreen` icine query helper eklendi:
  - `readCollectionQueryFilters()`
- Filtre state ilklendirme davranisi:
  - once URL query parametreleri
  - sonra localStorage fallback
- Filtre degistikce URL guncellemesi:
  - `closure`, `invoice`, `party` parametreleri `replaceState` ile senkronlanir
  - bos filtrelerde parametre URL'den silinir

## Dogrulama
- `npm run build` basarili.

## Sonraki Adim
Ayni query-string desenini satis faturasi ve cari liste ekranlarina da uygulamak.
