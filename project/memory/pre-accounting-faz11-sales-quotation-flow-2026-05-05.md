# Ön Muhasebe Faz 11 - Satış Teklifi Akışı - 2026-05-05

## Kapsam
- Satış ekranına ERPNext standard `Quotation` kaynağına bağlı teklif oluşturma akışı eklendi.
- Akış `sales_invoice.show_quotation_flow` tenant ayarıyla kontrol edilir.
- Son teklifler mobil kart listesi olarak satış ekranında gösterilir.

## Teknik Not
- API çağrıları `salesInvoiceService.ts` içinde kaldı.
- Hook katmanı fatura ve teklif verilerini birlikte yükler, kayıt sonrası listeyi yeniler.
- UI tarafında `MobileStepFlow` kullanılarak müşteri/ürün ve teklif detay adımları ayrıldı.
- Yeni veri kopyası veya custom DocType açılmadı.

## Doğrulama
- `npm test -- --run` başarılı.
- `npm run -s build` başarılı.
- `npm run test:e2e` başarılı.
