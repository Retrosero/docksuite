# Ön Muhasebe Faz 12 - E-belge Hazırlık Katmanı - 2026-05-05

## Kapsam
- Satış faturası ekranına e-fatura/e-arşiv entegrasyonu öncesi hazırlık paneli eklendi.
- `sales_invoice.show_e_document_readiness` ayarıyla panel tenant kontrollü hale getirildi.
- Kesilmiş `Sales Invoice` kayıtlarından hazır belge adedi, taslak bekleyen adedi ve hazır tutar özeti türetildi.

## Teknik Not
- Yeni DocType veya veri kopyası oluşturulmadı.
- `buildEDocumentReadinessSummary` domain helper olarak service katmanında tutuldu.
- UI sadece özet gösterir; dış entegratör gönderimi bu fazda başlatılmaz.

## Doğrulama
- `npm test -- --run`
- `npm run test:e2e`
- `npm run -s build`
