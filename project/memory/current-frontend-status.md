# Current Frontend Status

## Faz 4 Baslangici
- Tarih: 2026-04-13
- Workspace: `project/frontend/shipyard-portal`
- Durum: ilk operasyon ekranlari baslatildi

## Mevcut yapi
- Vite + React + TypeScript iskeleti eklendi
- mobile-first operasyon dashboard'u aciliyor
- tenant-safe config `src/config/tenant.ts` icinde tutuluyor
- dashboard verisi simdilik mock snapshot olarak feature klasorunde tutuluyor
- operasyon akislari `src/features/operations` altinda ilk kez modelleniyor
- Flowbite MIT component dili, operasyon ekranlarinda oncelikli tasarim referansi olarak kullaniliyor

## Sonraki teknik adimlar
1. auth/bootstrap akisi
2. ERPNext REST client
3. operasyon ekranlarini gercek veri ile beslemek
4. gorev / ekip / saha bildirim / zimmet / attendance ayrik feature'larini olgunlastirmak
5. Flowbite benzeri shared component wrapper'larini standartlastirmak

## Not
- Bu katman ERPNext core'dan ayrik tutulur.
- Marka ve tenant farklari config/theme token ile yonetilecektir.
