# Phase 3 - Shipyard Portal Foundation

## Tarih
- 2026-04-13

## Amac
Faz 3 kapsamindaki ozel frontend temelini bos klasor seviyesinden calisabilir bir portal iskeletine tasimak.

## Uygulanan kararlar
1. `shipyard-portal` ayri frontend workspace olarak tutulur.
2. ERPNext core degistirilmez; entegrasyon sonraki adimda REST istemcisiyle eklenir.
3. Tenant farkliliklari `src/config` katmaninda tutulur.
4. Sayfa seviyesinde yalnizca orkestrasyon yapilir; ekran parcasi component-first ilerler.
5. Ilk ekran olarak Turkce, mobil-oncelikli operasyon dashboard'u acilir.

## Klasor yapisi
- `src/app`: shell ve uygulama seviyesi bilesenler
- `src/pages`: sayfa orkestrasyonu
- `src/features/dashboard`: dashboard feature bilesenleri ve tipleri
- `src/config`: tenant-safe ayarlar
- `src/styles`: global tema ve layout stilleri

## Bu adimda olmayanlar
- auth
- ERPNext API baglantisi
- router
- gercek veri
- role/permission matrisi

## Kabul kriterleri
- `npm install` sonrasi uygulama acilabilir olmali
- `npm run build` basarili olmali
- UI Turkce ve mobil uyumlu olmali
- tenant sabitleri component icine gomulmemeli
