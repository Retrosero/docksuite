# Ön Muhasebe Faz 15 - Rapor CSV Export - 2026-05-05

## Kapsam
- Raporlar ekranına CSV indirme aksiyonu eklendi.
- `reports.enable_csv_export` tenant ayarı tanımlandı.
- Rapor özeti CSV satırlarına ve dosya içeriğine dönüştüren helper'lar eklendi.

## Teknik Not
- Rapor verisi mevcut `useReportSummary` hook'u üzerinden gelir.
- CSV üretimi `reportsService.ts` içinde test edilebilir domain helper olarak tutuldu.
- Page katmanı sadece dosya indirme davranışını yönetir.

## Doğrulama
- `npm test -- --run`
- `npm run test:e2e`
- `npm run -s build`
