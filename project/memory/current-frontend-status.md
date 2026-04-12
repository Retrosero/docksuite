# Current Frontend Status

## Faz 3 Baslangici
- Tarih: 2026-04-13
- Workspace: `project/frontend/shipyard-portal`
- Durum: frontend temeli baslatildi

## Mevcut yapi
- Vite + React + TypeScript iskeleti eklendi
- mobile-first operasyon dashboard'u aciliyor
- tenant-safe config `src/config/tenant.ts` icinde tutuluyor
- dashboard verisi simdilik mock snapshot olarak feature klasorunde tutuluyor

## Sonraki teknik adimlar
1. auth/bootstrap akisi
2. ERPNext REST client
3. gorev listesi feature'i
4. saha bildirimi formu

## Not
- Bu katman ERPNext core'dan ayrik tutulur.
- Marka ve tenant farklari config/theme token ile yonetilecektir.
