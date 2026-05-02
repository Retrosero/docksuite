# Skill - Ön Muhasebe Modül İsteğini Teknik Plana Çevirme

## Amaç
Doğal dilde gelen ön muhasebe isteğini ERPNext uyumlu, tenant-safe ve mobil hazır teknik plana çevirmek.

## Adımlar
1. İstek hangi modüle ait belirle: dashboard, cari, satış, tahsilat, gider, ödeme, stok, rapor, ayarlar.
2. İstek veri modeli mi, UI mı, işlem akışı mı, rapor mu ayır.
3. ERPNext standard DocType karşılığını ara.
4. Standart alan yeterli mi kontrol et.
5. Yeni alan gerekiyorsa Custom Field mı New DocType mı karar ver.
6. Özel endpoint gerekir mi, yoksa resource API yeterli mi belirle.
7. Mobil/React Native taşınabilirliği için servis, tip ve UI ayrımını yaz.
8. Özellik ayardan kontrol edilebilir mi kontrol et.
9. Tenant'a özel hardcode riski var mı kontrol et.

## Çıktı formatı
- istek özeti
- etkilenen modül
- ERPNext DocType eşlemesi
- standart alanlar
- custom alan/doctype ihtiyacı
- API planı
- component planı
- ayar anahtarları
- mobil hazırlık notu
- SaaS/multi-tenant kontrolü
