# Saha Satış Monorepo (Capacitor Ready)

Bu klasör Faz 0 başlangıç iskeletidir.

Hedef:
- web/PWA geliştirmeye hemen başlamak
- platform bağımlı kodu ilk günden abstraction katmanına almak
- iOS/Android için `apps/mobile-shell` altında native shell hazırlamak

## Monorepo Yapısı

```text
apps/
  web/            -> Next.js, mobil öncelikli saha satış arayüzü
  admin/          -> Next.js, yönetim paneli
  api/            -> NestJS, tenant-safe backend omurga
  mobile-shell/   -> Capacitor native shell placeholder
packages/
  contracts/      -> ortak DTO ve API contract tipleri
  shared/         -> ortak yardımcılar
  ui/             -> paylaşılan UI bileşenleri için başlangıç paket
  offline-db/     -> offline/sync depolama abstractions başlangıcı
  platform-bridge/-> camera/network/share/file/lifecycle/push/barcode interface katmanı
```

## Kritik Mimari Kurallar

- Kamera, ağ, paylaşım, dosya, app lifecycle, push ve barkod erişimleri component içinde kullanılmaz.
- Web implementasyonları `apps/web/src/platform/web` altında tutulur.
- Domain/business logic katmanı platform detaylarından bağımsız kalır.
- Tüm kullanıcıya dönük metinler Türkçe tutulur.

## Başlangıç Komutları

```bash
pnpm install
pnpm dev:web
pnpm dev:admin
pnpm dev:api
```
