# Global Rules — Component First

## Ana ilke
Tüm projeler component mantığıyla geliştirilmelidir.

## Kurallar
1. Büyük sayfalar tek parça yazılmamalıdır.
2. Her ekran:
   - page
   - section
   - feature component
   - shared ui component
   olarak bölünmelidir.
3. Tekrar eden UI parçaları ortak bileşene dönüştürülmelidir.
4. Business logic doğrudan görsel component içine gömülmemelidir.
5. API çağrıları component içinde dağınık halde yazılmamalıdır.
6. Form yönetimi, veri çekme ve görünüm mantığı ayrılmalıdır.
7. Her yeni özellik için önce mevcut component envanteri kontrol edilmelidir.
8. Kopyala-yapıştır component çoğaltmak yerine varyasyonlu reusable yapı tercih edilmelidir.

## Hedef yapı
- components/ui
- components/shared
- features/{feature-name}
- services
- types
- hooks
