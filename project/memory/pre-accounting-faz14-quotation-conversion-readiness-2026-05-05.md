# Ön Muhasebe Faz 14 - Teklif Dönüşüm Hazırlığı - 2026-05-05

## Kapsam
- Satış ekranına teklif dönüşüm hazırlık paneli eklendi.
- `sales_invoice.show_quotation_conversion_readiness` tenant ayarı tanımlandı.
- `Quotation` kayıtlarında `docstatus` ve `status` değerlerine göre dönüşüm adayı, dönüşmüş ve taslak teklif sayaçları üretildi.

## Teknik Not
- Bu faz fiili sipariş/fatura dönüşümü yapmaz; dönüşüm için güvenli aday listesini hazırlar.
- Teklif satır detayları çekilmeden otomatik fatura oluşturulmadı.
- Veri ERPNext standard `Quotation` kaynağından okunur, kopyalanmaz.

## Doğrulama
- `npm test -- --run`
- `npm run test:e2e`
- `npm run -s build`
