# Shipyard Rules — ERPNext Integration

1. ERPNext core doğrudan değiştirilmez.
2. Frappe HR çekirdeği korunur.
3. Tüm özel geliştirmeler `core_app` ve `shipyard_app` içinde yapılır.
4. Veri tek kaynak olarak ERPNext/Frappe içinde tutulur.
5. Frontend yalnızca sade kullanım katmanıdır.
6. Yeni alan gerektiğinde önce standard alanlar kontrol edilir.
7. Gerekirse Custom Field açılır.
8. Tekrarlayan işlem/geçmiş yapıları için yeni DocType açılır.
9. Aynı veri ikinci veritabanında tutulmaz.
10. Çok tenantlı ürün mantığında site bazlı izolasyon korunur.
11. Tek tenant varsayımıyla veri modeli kurulmaz.
