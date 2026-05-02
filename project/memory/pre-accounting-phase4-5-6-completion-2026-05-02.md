# On Muhasebe Faz 4-5-6 Tamamlama Notu (2026-05-02)

## Faz 4 - Gider + Odeme
- Canli `Purchase Invoice` liste/olusturma akisi eklendi.
- Canli tedarikci odemesi (`Payment Entry` payment_type=Pay) olusturma ve listeleme eklendi.
- Gider ekrani artik placeholder degil, ERPNext verisiyle calisiyor.

## Faz 5 - Stok + Raporlar + Kasa/Banka
- Stok modulu canli veri:
  - `Item` + `Bin` uzerinden toplam stok, depo adedi, kritik urun adedi
  - urun bazli tablo
- Raporlar modulu canli ozet:
  - toplam satis
  - toplam tahsilat
  - net bakiye
- Kasa/Banka modulu eklendi:
  - yeni route: `/kasa-banka`
  - `Account` + `GL Entry` tabanli bakiye ozetleri

## Faz 6 - Mobil Hazirlik
- Ortak domain helper dosyasi eklendi:
  - `shared/utils/financeDomain.ts`
- React Native akislari ve mobil readiness spec dosyasi eklendi:
  - `project/specs/pre-accounting/03-mobile-readiness-and-react-native-flow.md`

## Dogrulama
- `npm run build` basarili.

## Not
- E-fatura/e-arsiv, teklif/siparis ve iptal/iade akislari urun backlog'unda ileri adim olarak kalir.
