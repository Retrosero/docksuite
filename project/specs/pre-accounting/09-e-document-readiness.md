# Ön Muhasebe Faz 12 - E-belge Hazırlık Katmanı

## Amaç
E-fatura/e-arşiv entegrasyonuna geçmeden önce satış faturası ekranında gönderime hazır belge adaylarını tenant kontrollü ve mobil uyumlu şekilde görünür yapmak.

## Kapsam
- Kesilmiş `Sales Invoice` kayıtlarından e-belge hazırlık özeti üretme.
- Satış ekranında hazır fatura, taslak bekleyen ve hazır tutar kartları.
- Dış entegratör bağımlılığı olmadan ileride bağlanacak servis noktası için UI/domain sözleşmesi.

## ERPNext Kaynakları
- `Sales Invoice`

## Ayar Anahtarı
- key: `sales_invoice.show_e_document_readiness`
- grup: Satış ve Fatura
- varsayılan: `true`
- kapsam: tenant
- plan: `ticari`, `mobil`
- frontend davranışı: Kapalıysa e-belge hazırlık paneli render edilmez.
- backend kontrolü: Bu fazda sadece standard `Sales Invoice` okuması vardır.
- mobil etkisi: Satış ekranında e-belge hazırlık kartları tek kolonda taşmadan görünür.

## Kabul Kriterleri
- ERPNext core değiştirilmez.
- E-belge durumu ayrı tabloda kopyalanmaz.
- Panel ayar anahtarına bağlıdır.
- Unit test ve mobil smoke test kapsamı vardır.
- Test, e2e ve build başarılıdır.
