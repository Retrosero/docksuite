# Pre-accounting Portal Mobile Playwright Smoke

Tarih: 2026-05-04

## Kapsam
- `pre-accounting-portal` icin Playwright e2e altyapisi eklendi.
- Mobil stabilizasyon checklistindeki manuel viewport kontrolleri otomatik smoke testlere tasindi.
- API bagimliligi tenant bagimsiz kalmasi icin test seviyesinde mocklandi.

## Eklenen Kontroller
- Ana route kabugu 360px, 390px, 768px ve desktop genisliklerinde tasma yapmadan acilir.
- Satis hizli akisi `Cari ve urun` ve `Tutar` adimlarini mobilde gorunur tutar.
- Tahsilat hizli akisi `Fatura sec` ve `Odeme al` adimlarini ve Turkce kapanis durumlarini korur.
- Gider ekraninda `Alis Faturasi` ve `Tedarikci Odemesi` segmentleri mobilde erisilebilir kalir.

## Dogrulama
- `npm test -- --run` -> 23 test basarili.
- `npm run test:e2e` -> 16 Playwright testi basarili.
- `npm run -s build` -> production build basarili.
