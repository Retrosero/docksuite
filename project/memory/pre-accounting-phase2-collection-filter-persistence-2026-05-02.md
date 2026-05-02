# On Muhasebe Faz 2 - Tahsilat Filtre Kaliciligi (2026-05-02)

## Kapsam
Tahsilat tablosu filtrelerinin sayfa yenileme sonrasinda korunmasi eklendi.

## Yapilanlar
- `CollectionScreen` filtre state'leri `localStorage` ile kalici hale getirildi:
  - `collection_filter_closure`
  - `collection_filter_invoice`
  - `collection_filter_party`
- Ilk acilista filtre degerleri storage'dan okunuyor.
- Filtre degistiginde storage otomatik guncelleniyor (`useEffect`).

## Dogrulama
- `npm run build` basarili.

## Sonraki Adim
Filtreleri URL query-string ile senkronlayip paylasilabilir filtreli link destegi eklemek.
