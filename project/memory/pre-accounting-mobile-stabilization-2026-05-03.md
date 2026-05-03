# Ön Muhasebe Mobil Stabilizasyon - 2026-05-03

## Kapsam
- Faz 8 başlangıcı olarak mobil ticari kabuğun route ve ayar omurgası otomatik testlerle koruma altına alındı.
- Mobil smoke checklist spec olarak kayda alındı.

## Yapılanlar
- `src/app/routes.spec.ts` eklendi:
  - zorunlu route listesi
  - benzersiz path kontrolü
  - bilinmeyen route fallback kontrolü
- `src/config/featureFlags.spec.ts` eklendi:
  - zorunlu feature setting anahtarları
  - boolean varsayılan kontrolü
- `project/specs/pre-accounting/05-mobile-stabilization-checklist.md` eklendi.

## Doğrulama
- `npm test -- --run` başarılı.
- `npm run -s build` başarılı.

## Sonraki Adım
- Mobil smoke checklist'i Playwright viewport testlerine taşımak.
- Ardından Faz 9: tenant ayarlarını localStorage yerine backend ayar API'sine taşımak.
