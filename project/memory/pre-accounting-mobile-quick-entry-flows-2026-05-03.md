# Ön Muhasebe Mobil Hızlı İşlem Akışları - 2026-05-03

## Kapsam
- Satış, tahsilat ve gider/alış formları mobil hızlı işlem akışına çevrildi.
- Uzun tek parça formlar yerine kısa adımlı kullanım eklendi.

## Yapılanlar
- Ortak UI:
  - `shared/ui/MobileStepFlow.tsx`
  - adım sekmeleri
  - işlem önizleme kartı stilleri
  - mobil uyumlu toplam satırı
- Satış:
  - Cari ve ürün seçimi ayrı adım.
  - Miktar/fiyat ve fatura önizleme ayrı adım.
- Tahsilat:
  - Müşteri ve açık fatura seçimi ayrı adım.
  - Ödeme yöntemi/tutar ve kalan borç özeti ayrı adım.
- Gider ve ödeme:
  - Alış faturası / tedarikçi ödemesi segment seçimi eklendi.
  - Her işlem kendi kısa adımlarına ayrıldı.
- Tahsilat kapanış metinleri Türkçe karakterli hale getirildi:
  - `Tam Kapandı`
  - `Kısmi Tahsilat`

## Doğrulama
- `npm test -- --run` başarılı.
- `npm run -s build` başarılı.

## Sonraki Adım
- Hızlı işlem akışları için mobil ekran smoke checklist ve Playwright görsel kontrol eklemek.
