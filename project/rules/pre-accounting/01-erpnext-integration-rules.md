# Ön Muhasebe Kuralları - ERPNext Entegrasyonu

## Çekirdek koruma
1. ERPNext core dosyaları değiştirilmez.
2. Frappe core dosyaları değiştirilmez.
3. Özel geliştirmeler `pre_accounting_app` içinde yapılır.
4. Web/mobil kullanım katmanı ERPNext verisini kopyalamaz.

## Standart DocType önceliği
Ön muhasebe ekranlarında önce şu ERPNext DocType'ları değerlendirilir:
- Customer
- Supplier
- Item
- Warehouse
- Account
- Sales Invoice
- Purchase Invoice
- Payment Entry
- Journal Entry
- GL Entry
- Mode of Payment

## Karar mantığı
1. Standart DocType ve alan yeterliyse yeni yapı açma.
2. Var olan kayda ürün genelinde geçerli ek nitelik gerekiyorsa Custom Field kullan.
3. Ayrı geçmiş, log, onay veya işlem kaydı gerekiyorsa New DocType düşün.
4. Standart REST resource API yeterliyse özel endpoint yazma.
5. Özel endpoint yalnızca standart API iş akışını güvenli ve sade tamamlamıyorsa yazılır.

## Tenant güvenliği
1. Her müşteri ayrı site/veritabanı ile çalışır.
2. Kod içinde sabit tenant/site/firma değeri tutulmaz.
3. Tenant ayarları Single DocType, config veya product profile ile çözülür.
4. Fixtures yeni tenant kurulumunda tekrar uygulanabilir olmalıdır.
