# Ön Muhasebe Faz 13 - Satış İptal ve İade Hazırlığı

## Amaç
Satış faturası iptal/iade akışına geçmeden önce ERPNext standard `Sales Invoice` iade modeline dayalı hazırlık görünürlüğü sağlamak.

## Kapsam
- Kesilmiş normal faturaları iade adayı olarak özetleme.
- `is_return` işaretli satış faturalarını mevcut iade kaydı olarak sayma.
- Satış ekranında mobil uyumlu iptal/iade hazırlık paneli.

## ERPNext Kaynakları
- `Sales Invoice`
- Standard alanlar: `docstatus`, `is_return`, `return_against`

## Ayar Anahtarı
- key: `sales_invoice.show_return_readiness`
- grup: Satış ve Fatura
- varsayılan: `true`
- kapsam: tenant
- plan: `ticari`, `mobil`
- frontend davranışı: Kapalıysa iptal/iade hazırlık paneli render edilmez.
- backend kontrolü: Bu fazda sadece standard `Sales Invoice` okuması vardır.
- mobil etkisi: Satış ekranında iade hazırlık kartları tek kolonda görünür.

## Kabul Kriterleri
- ERPNext core değiştirilmez.
- İade verisi ikinci bir yerde kopyalanmaz.
- Panel ayar anahtarına bağlıdır.
- Unit ve Playwright smoke kapsamı vardır.
- Test, e2e ve build başarılıdır.
