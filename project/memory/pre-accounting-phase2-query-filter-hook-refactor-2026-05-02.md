# On Muhasebe Faz 2 - Query Backed Filter Hook Refactor (2026-05-02)

## Kapsam
Satis Faturasi, Cari ve Tahsilat ekranlarindaki query/localStorage filtre senkron mantigi ortak hook'a tasindi.

## Yapilanlar
- Yeni ortak hook:
  - `shared/hooks/useQueryBackedFilter.ts`
- Hook davranisi:
  - ilk degeri query parametresinden okur
  - query yoksa localStorage fallback kullanir
  - degisimlerde localStorage + URL query'yi senkronlar
  - opsiyonel `allowedValues` ile whitelist kontrolu yapar
- Ekran refactorlari:
  - `CollectionScreen`
  - `SalesInvoiceScreen`
  - `CariListScreen`

## Sonuc
- Davranis korunurken tekrar eden kod azaltildi.
- Filtre state mantigi tek yerde toplandi.

## Dogrulama
- `npm run build` basarili.
