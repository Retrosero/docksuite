# Ön Muhasebe Faz 14 - Teklif Dönüşüm Hazırlığı

## Amaç
Tekliften sipariş veya faturaya geçiş akışına başlamadan önce ERPNext standard `Quotation` durumlarına göre dönüşüm adaylarını görünür yapmak.

## Kapsam
- Onaylı ve henüz dönüşmemiş teklifleri dönüşüm adayı olarak özetleme.
- Dönüşmüş ve taslak teklif sayaçları.
- Satış ekranında mobil uyumlu dönüşüm hazırlık paneli.

## ERPNext Kaynakları
- `Quotation`
- Standard alanlar: `docstatus`, `status`

## Ayar Anahtarı
- key: `sales_invoice.show_quotation_conversion_readiness`
- grup: Satış ve Fatura
- varsayılan: `true`
- kapsam: tenant
- plan: `ticari`, `mobil`
- frontend davranışı: Kapalıysa teklif dönüşüm hazırlık paneli render edilmez.
- backend kontrolü: Bu fazda sadece standard `Quotation` okuması vardır.
- mobil etkisi: Satış ekranında dönüşüm adayı teklif özeti görünür.

## Kabul Kriterleri
- ERPNext core değiştirilmez.
- Teklif verisi ikinci bir yerde kopyalanmaz.
- Panel ayar anahtarına bağlıdır.
- Unit ve Playwright smoke kapsamı vardır.
- Test, e2e ve build başarılıdır.
