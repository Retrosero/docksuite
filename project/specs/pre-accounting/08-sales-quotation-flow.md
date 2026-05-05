# Ön Muhasebe Faz 11 - Satış Teklifi Akışı

## Amaç
Satış ekranını fatura oluşturmadan önce müşteri ve ürün bazlı teklif hazırlayabilen, ERPNext standard `Quotation` kaynağına bağlı mobil-first bir akışla genişletmek.

## Kapsam
- Satış ekranında ayar kontrollü `Yeni Teklif` hızlı giriş akışı.
- Müşteri, ürün, miktar, birim fiyat ve geçerlilik tarihi alanları.
- Son tekliflerin mobil kart listesi.
- Türkçe validasyon ve kayıt sonrası kısa başarı mesajı.

## ERPNext Kaynakları
- `Quotation`
- `Customer`
- `Item`

## Ayar Anahtarı
- key: `sales_invoice.show_quotation_flow`
- grup: Satış ve Fatura
- varsayılan: `true`
- kapsam: tenant
- plan: `ticari`, `mobil`
- frontend davranışı: Kapalıysa teklif butonu, formu ve son teklifler listesi render edilmez.
- backend kontrolü: Standard resource API kullanılır; tenant/site izolasyonu Frappe site üzerinden korunur.
- mobil etkisi: Satış ekranında teklif hızlı giriş adımları görünür.

## Kabul Kriterleri
- Teklif kaydı ERPNext `Quotation` kaynağına yazılır.
- Component içinde doğrudan API çağrısı yoktur.
- Mobil smoke testlerinde teklif paneli taşmadan açılır.
- Unit testlerde teklif form validasyonu kapsanır.
- Test, e2e ve build başarılıdır.
