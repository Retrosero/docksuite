# Ön Muhasebe Tenant Ayar API - 2026-05-03

## Yapılan
- Ön muhasebe feature ayarları için Frappe whitelisted API eklendi.
- Ayarlar site/tenant seviyesinde `pre_accounting_feature_settings` global default anahtarıyla saklanacak şekilde tasarlandı.
- Frontend `settingsService`, önce ERP endpoint'lerini kullanacak ve başarısız durumda localStorage fallback'e dönecek şekilde güncellendi.
- Eksik backend payload durumunda ürün varsayılanlarını tamamlayan helper testi eklendi.

## Teknik Karar
- Yeni DocType açılmadı; ayarlar küçük boolean map olduğu için Frappe default kaydı yeterli görüldü.
- ERPNext core değiştirilmedi.
- Component içine API çağrısı eklenmedi.

## Sonraki Adım
- Ayarlar ekranına rol/yetki görünürlüğü ve plan bazlı paket kontrolü eklenebilir.
- Kritik işlem endpoint'leri oluştuğunda ilgili feature flag backend tarafında da doğrulanmalıdır.
