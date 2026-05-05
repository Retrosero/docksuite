# Ön Muhasebe Faz 17 - Müşteri ve Ürün Kartı Oluşturma Gelişmiş Spec

## Amaç
Ön muhasebe kullanıcısının ERPNext Desk karmaşıklığına girmeden yeni müşteri ve yeni ürün kartı oluşturabilmesini sağlamak.

## Kapsam
1. Müşteri kartı hızlı oluşturma
2. Ürün kartı hızlı oluşturma
3. Tenant kontrollü görünürlük
4. Mobil-first kısa form
5. Unit, Playwright ve build doğrulaması

## ERPNext Kaynakları
- `Customer`
- `Customer Group`
- `Territory`
- `Item`
- `Item Group`
- `UOM`

## Faz Sırası

### Faz 17.1 - Müşteri Kartı
- `Customer` create service
- müşteri adı, müşteri tipi, müşteri grubu, bölge alanları
- grup ve bölge lookup listeleri
- kayıt sonrası liste yenileme

### Faz 17.2 - Ürün Kartı
- `Item` create service
- ürün kodu, ürün adı, ürün grubu, stok birimi, stoklu/stoksuz seçimi
- ürün grubu ve UOM lookup listeleri
- kayıt sonrası liste yenileme

### Faz 17.3 - Ayar ve Stabilizasyon
- `customer.allow_quick_create`
- `product.allow_quick_create`
- validasyon testleri
- mobile smoke testleri

## Ayar Anahtarları
- key: `customer.allow_quick_create`
  - grup: Cari
  - varsayılan: `true`
  - kapsam: tenant
  - plan: tüm planlar
- key: `product.allow_quick_create`
  - grup: Stok
  - varsayılan: `true`
  - kapsam: tenant
  - plan: tüm planlar

## Kurallar
- ERPNext core değiştirilmez.
- Yeni DocType açılmaz.
- Firma/tenant özel grup veya UOM değeri koda gömülmez.
- Lookup listesi boşsa kullanıcıya Türkçe hata/uyarı gösterilir.
- API çağrıları component içine yazılmaz.
- Kayıt başarılı olursa liste yenilenir.

## Kabul Kriterleri
- Müşteri kartı standard `Customer` kaynağına yazılır.
- Ürün kartı standard `Item` kaynağına yazılır.
- Formlar mobilde taşmadan açılır.
- Opsiyonel görünürlük ayar anahtarlarıyla yönetilir.
- Test, e2e ve build başarılıdır.
- Memory ve git akışı tamamlanır.
