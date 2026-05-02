# Ön Muhasebe Kuralları - Ürün

## Temel ilke
Bu ürün tek firmaya özel ön muhasebe ekranı değil, birden fazla firmaya satılacak SaaS ön muhasebe ERP ürünüdür.

## Kurallar
1. Tüm arayüz metinleri Türkçe olmalıdır.
2. ERPNext muhasebe çekirdeği yeniden yazılmaz.
3. Satış, satın alma, ödeme, stok ve cari verileri ERPNext/Frappe içinde tutulur.
4. Frontend sadece sade kullanım ve hızlı işlem katmanıdır.
5. Tek firma adı, özel vergi bilgisi, özel belge metni veya müşteri süreci koda gömülmez.
6. Modül, ekran, kolon, buton ve işlem farklılıkları ayar/config ile yönetilir.
7. Her yeni yapı tenant'tan bağımsız tekrar kurulabilir olmalıdır.
8. Gereksiz DocType açılmaz; önce ERPNext standardı kullanılır.
9. Yeni custom alan gerekiyorsa ürün genelinde tekrar kullanılabilir olmalıdır.
10. Fazlar küçük, doğrulanabilir ve geri alınabilir parçalara bölünür.
