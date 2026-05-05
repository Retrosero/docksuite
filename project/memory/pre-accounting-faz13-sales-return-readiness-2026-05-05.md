# Ön Muhasebe Faz 13 - Satış İptal ve İade Hazırlığı - 2026-05-05

## Kapsam
- Satış ekranına iptal/iade hazırlık paneli eklendi.
- `sales_invoice.show_return_readiness` tenant ayarı tanımlandı.
- `Sales Invoice` kayıtlarında `docstatus`, `is_return`, `return_against` alanları okunur hale getirildi.
- İade adayı, mevcut iade kaydı ve taslak bekleyen sayaçları eklendi.

## Teknik Not
- Yeni DocType veya veri kopyası oluşturulmadı.
- Bu faz fiili iade kaydı oluşturmaz; ERPNext standard iade modeline göre görünürlük ve hazırlık katmanı sağlar.
- Sonraki küçük fazda iade formu ve `is_return` kaydı oluşturma akışı eklenebilir.

## Doğrulama
- `npm test -- --run`
- `npm run test:e2e`
- `npm run -s build`
