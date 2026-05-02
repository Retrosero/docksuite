# Ön Muhasebe SaaS ERP Ürün Spec'i

## Amaç
Bu proje, ERPNext çekirdeğine dokunmadan geliştirilecek, tamamen Türkçe, mobil uyumlu ve ileride React Native mobil uygulamaya taşınabilecek bir ön muhasebe SaaS ürünüdür.

Ürün hedefi:
- küçük ve orta ölçekli firmaların günlük ön muhasebe işlerini sadeleştirmek
- ERPNext'in muhasebe, satış, satın alma, stok ve cari altyapısını veri kaynağı olarak kullanmak
- kullanıcıya ERPNext karmaşıklığını göstermeden hızlı işlem ekranları sunmak
- aynı kod tabanıyla birden fazla firmaya satılabilir, tekrar kurulabilir bir ürün oluşturmak

## Temel Mimari Karar
ERPNext/Frappe çekirdeği değiştirilmez. Tüm özel geliştirmeler yeni custom app ve ayrı frontend katmanı içinde yapılır.

Önerilen yapı:
- Backend custom app: `pre_accounting_app`
- Web frontend: `project/frontend/pre-accounting-portal`
- Mobil hazırlık: web frontend servis, tip ve domain mantığı React Native'e taşınabilir olacak şekilde ayrılır
- Kurallar/specs: `project/rules/pre-accounting`, `project/skills/pre-accounting`, `project/specs/pre-accounting`

## Multi-Tenant SaaS Modeli
Her müşteri ayrı Frappe site ve ayrı veritabanı ile çalışır.

Kurallar:
- kod tabanı ortak kalır
- firma adı, vergi numarası, belge şablonu, renk, logo, modül erişimi ve ekran görünürlüğü config ile yönetilir
- tenant özel davranış kod içine gömülmez
- tenant izolasyonu site/veritabanı seviyesinde korunur
- fixtures ve custom app kurulumları yeni siteye tekrar uygulanabilir olmalıdır

## Hedef Kullanıcı Rolleri
- firma sahibi
- muhasebe sorumlusu
- satış personeli
- satın alma personeli
- depo/stok sorumlusu
- saha/mobil kullanıcı
- destek/admin kullanıcısı

## İlk Ürün Modülleri

### 1. Dashboard
Amaç: günlük finans ve operasyon durumunu sade göstermek.

İlk metrikler:
- bugünkü satış toplamı
- bekleyen tahsilatlar
- vadesi geçen alacaklar
- bekleyen ödemeler
- düşük stok uyarıları
- son fatura ve tahsilat hareketleri

ERPNext kaynakları:
- Sales Invoice
- Payment Entry
- Purchase Invoice
- Journal Entry
- Customer
- Supplier
- Item
- Bin

### 2. Cari Yönetimi
Amaç: müşteri ve tedarikçi takibini sadeleştirmek.

Kapsam:
- müşteri listesi
- tedarikçi listesi
- cari detay özeti
- bakiye görünümü
- son hareketler
- hızlı arama

ERPNext kaynakları:
- Customer
- Supplier
- GL Entry
- Sales Invoice
- Purchase Invoice
- Payment Entry

### 3. Satış ve Fatura
Amaç: satış işlemlerini ERPNext standardına yazan sade ekranlar oluşturmak.

Kapsam:
- teklif/sipariş opsiyonel faz
- satış faturası oluşturma
- e-fatura/e-arşiv entegrasyonu için ileride bağlanabilir servis noktası
- fatura durumu
- iptal/iade akışı için sonraki faz notu

ERPNext kaynakları:
- Sales Invoice
- Sales Invoice Item
- Customer
- Item
- Taxes and Charges

### 4. Tahsilat
Amaç: müşteriden alınan ödemeleri hızlı kaydetmek.

Kapsam:
- nakit, banka, kredi kartı tahsilat kaydı
- faturaya bağlı tahsilat
- avans tahsilat
- tahsilat makbuzu görünümü

ERPNext kaynakları:
- Payment Entry
- Mode of Payment
- Account
- Sales Invoice

### 5. Gider ve Ödeme
Amaç: firma giderleri ve tedarikçi ödemelerini sade yönetmek.

Kapsam:
- alış faturası kaydı
- gider fişi
- tedarikçi ödeme kaydı
- ödeme vadesi takibi

ERPNext kaynakları:
- Purchase Invoice
- Payment Entry
- Supplier
- Account

### 6. Stok ve Ürün
Amaç: ön muhasebe kullanıcısının temel stok kartı ve stok durumunu yönetmesi.

Kapsam:
- ürün/hizmet listesi
- stok miktarı görünümü
- kritik stok uyarısı
- basit stok giriş/çıkış ekranı

ERPNext kaynakları:
- Item
- Item Group
- Warehouse
- Bin
- Stock Entry

### 7. Kasa/Banka
Amaç: nakit ve banka hesaplarını sade ekranda izlemek.

Kapsam:
- kasa hesabı özeti
- banka hesabı özeti
- son hareketler
- hesaplar arası transfer için sonraki faz

ERPNext kaynakları:
- Account
- Payment Entry
- Journal Entry
- GL Entry

### 8. Raporlar
Amaç: ön muhasebe için karar verdiren sade raporlar sunmak.

İlk raporlar:
- satış özeti
- tahsilat listesi
- vadesi geçen alacaklar
- borç listesi
- stok uyarı listesi
- cari bakiye özeti

## Ayarlar ve Özellik Kontrolü
Üründe sayfalara eklenen her opsiyonel buton, panel, kolon, filtre veya işlem için ayarlar sayfasında kontrol edilebilir bir yapı düşünülür.

Kural:
- Eğer özellik tenant, rol veya paket bazında değişebilecekse ayar kaydı olmalıdır.
- Göster/gizle davranışı component içinde hardcode edilmez.
- Ayar anahtarı standart isimlendirme ile tutulur.

Önerilen ayar grupları:
- Genel Ayarlar
- Modül Görünürlüğü
- Sayfa Alanları
- Buton ve İşlem Yetkileri
- Belge/Fatura Ayarları
- Bildirim Ayarları
- Mobil Uygulama Ayarları
- Tenant Marka Ayarları

Örnek ayar anahtarları:
- `dashboard.show_overdue_receivables`
- `sales_invoice.show_discount_button`
- `sales_invoice.allow_draft_save`
- `customer.show_balance_panel`
- `stock.show_low_stock_alert`
- `payment.allow_advance_payment`
- `mobile.enable_quick_collection`

## React Native'e Hazırlık Kuralları
Web frontend, ileride React Native uygulamaya taşınacak şekilde geliştirilir.

Kurallar:
- domain servisleri UI framework'ünden bağımsız tutulur
- API istemcisi merkezi olur
- TypeScript tipleri web ve mobil tarafından paylaşılabilir tasarlanır
- tarih, para birimi, durum etiketi ve validasyon mantığı shared domain helper'larda tutulur
- component içine doğrudan ERPNext API çağrısı yazılmaz
- route/page katmanı iş mantığı taşımaz
- mobilde offline/poor network ihtimali için hata ve loading durumları net tasarlanır

## ERPNext Standard vs Custom Kararı
Önce standart ERPNext yapısı kullanılır.

Karar mantığı:
- var olan standard DocType yeterliyse yeni DocType açma
- standard DocType'a ürün genelinde geçerli ek özellik gerekiyorsa Custom Field düşün
- tekrar eden ayrı işlem/geçmiş gerekiyorsa New DocType düşün
- sadece sade kullanım gerekiyorsa custom frontend yeterlidir

İlk fazda özel DocType açmadan önce şu standardlar denenir:
- Customer
- Supplier
- Item
- Warehouse
- Sales Invoice
- Purchase Invoice
- Payment Entry
- Journal Entry
- Account
- GL Entry

## İlk Faz Planı

### Faz 0 - Proje Temeli
- pre-accounting rules/skills/specs hazırlanır
- app adı ve frontend klasör yapısı netleştirilir
- ayar kontrollü özellik standardı yazılır
- ERPNext standard DocType eşlemesi çıkarılır

### Faz 1 - Portal İskeleti
- Vite + React + TypeScript web portal temeli
- mobile-first layout
- Türkçe navigasyon
- tenant/theme config
- merkezi ERPNext API client

### Faz 2 - Dashboard + Cari
- dashboard özetleri
- müşteri/tedarikçi listesi
- cari detay ve bakiye görünümü
- ayar kontrollü kart/panel görünürlüğü

### Faz 3 - Satış Faturası + Tahsilat
- satış faturası liste/oluşturma
- tahsilat kaydı
- fatura-tahsilat bağlantısı
- rol ve ayar bazlı aksiyon görünürlüğü

### Faz 4 - Gider + Ödeme
- alış/gider kaydı
- tedarikçi ödeme kaydı
- vade takibi

### Faz 5 - Stok + Raporlar
- ürün/stok görünümü
- kritik stok uyarıları
- temel operasyon raporları

### Faz 6 - Mobil Hazırlık
- shared domain paketleri ayrıştırılır
- React Native için ekran akışları belirlenir
- mobil öncelikli hızlı işlem ekranları netleştirilir

## Definition of Done
Bir faz tamamlandı sayılmadan önce:
- ERPNext core dosyalarına dokunulmadığı doğrulanır
- değişiklikler custom app veya frontend katmanında kalır
- UI metinleri Türkçedir
- mobil görünüm düşünülmüştür
- ayar kontrollü olması gereken her özellik ayar anahtarına bağlanmıştır
- tenant hardcode yoktur
- memory/spec güncellenmiştir
- test/build veya doküman doğrulaması yapılmıştır
- git akışı tamamlanmıştır
