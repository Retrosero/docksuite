# HR Self Service Auto Required Priority - 2026-04-26

## Scope
- Calisan paneli belge formunda zorunlu belge tipleri icin otomatik onceliklendirme ve auto-required davranisi eklendi.

## Implemented
- `src/features/hr-self-service/components/HrSelfServiceScreen.tsx`
  - Zorunlu tip seti + eksik zorunlu tip hesaplari eklendi.
  - Belge turu datalist'i oncelik sirasina gore olusturuluyor.
  - Form ilk acilista ve kayit sonrasinda bir sonraki oncelikli tip otomatik seciliyor.
  - Belge turu degisince `Zorunlu Belge` checkbox'i otomatik guncelleniyor.
  - Eksik zorunlu belgeler bilgi notu eklendi.

## Verification
- `npm test` basarili
- `npm run build` basarili
