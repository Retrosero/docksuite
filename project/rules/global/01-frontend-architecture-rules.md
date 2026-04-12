# Global Rules — Frontend Architecture

## Yapı kuralları
1. Feature-based klasörleme tercih edilir.
2. Ortak UI bileşenleri shared alanda tutulur.
3. Domain'e özel component'ler ilgili feature klasöründe tutulur.
4. Sayfa seviyesindeki dosyalar sadece düzenleme ve orkestrasyon yapmalıdır.
5. Veri işleme, dönüştürme ve API mantığı service/hook katmanında olmalıdır.
6. TypeScript tipleri merkezi ve anlamlı adlandırılmalıdır.
7. Tüm yeni ekranlar mobile-first tasarlanmalıdır.
8. Tüm arayüz metinleri Türkçe olmalıdır.
9. Aynı ürün birden fazla firmaya kurulacağı için tenant bağımlı sabitler component içine gömülmemelidir.
10. Marka / renk / başlık / ayar gibi tenant farklılıkları konfigürasyon katmanında tutulmalıdır.
