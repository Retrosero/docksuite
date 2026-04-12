# Shipyard Skill — Multi-Tenant Domain Checklist

## Amaç
Yeni modül veya DocType tasarlarken çok tenantlı SaaS uyumunu doğrulamak.

## Kontrol listesi
1. Bu yapı tüm müşterilerde tekrar kullanılabilir mi?
2. Tek bir firmanın özel sürecine göre fazla özelleştirilmiş mi?
3. Tenant özel davranış gerekiyorsa config ile çözülebilir mi?
4. Bu yapı site izolasyonunu bozuyor mu?
5. Veri modeli tenant bağımsız ürün standardı taşıyor mu?
6. Fixtures veya app ile yeni tenant'a taşınabilir mi?

## Kullanım
Yeni DocType, Custom Field veya modül tasarlamadan önce bu liste çalıştırılmalıdır.
