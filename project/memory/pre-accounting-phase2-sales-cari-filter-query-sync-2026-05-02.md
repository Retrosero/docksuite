# On Muhasebe Faz 2 - Satis ve Cari Filtre Query-String Senkronu (2026-05-02)

## Kapsam
`Satis Faturalari` ve `Cari` ekranlarina query-string + localStorage senkronlu filtreleme eklendi.

## Yapilanlar
- `SalesInvoiceScreen`:
  - filtreler eklendi:
    - durum (`Hepsi/Taslak/Kesildi`)
    - cari arama
    - fatura no arama
  - filtreler query parametrelerine yaziliyor:
    - `si_status`
    - `si_customer`
    - `si_invoice`
  - acilista once query parametreleri, sonra localStorage okunuyor
- `CariListScreen`:
  - filtreler eklendi:
    - tip (`Hepsi/Musteri/Tedarikci`)
    - cari ad arama
  - filtreler query parametrelerine yaziliyor:
    - `cari_type`
    - `cari_name`
  - acilista once query parametreleri, sonra localStorage okunuyor
- Her iki ekranda da filtreli sonuc listesi ve uygun bos durum mesaji eklendi.

## Dogrulama
- `npm run build` basarili.

## Sonraki Adim
Filtre state'lerini tekrari azaltmak icin ortak bir `useQueryBackedFilters` hook'u olusturmak.
