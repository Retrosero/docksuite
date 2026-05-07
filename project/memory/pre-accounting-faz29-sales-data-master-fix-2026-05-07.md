# Ön Muhasebe Faz 29 - Satış Ekranı Veri Sorunu Düzeltme - 2026-05-07

## Sorun Tanımı
Ön muhasebe uygulamasında yeni satış oluşturmak istendiğinde sistemde kayıtlı olan müşteriler ve stoklar listelerde görünmüyor.

## Tespit Edilen Sorunlar

### 1. Satış Ekranı Müşteri Listesi Sorunu
**Dosya:** `project/frontend/pre-accounting-portal/src/features/sales-invoice/services/salesInvoiceService.ts`
**Sorun:** `fetchSalesCustomers()` fonksiyonu API hatası durumunda boş array dönüyor ama hata yakalanmıyor
**Etki:** Dropdown'da müşteri listesi boş görünüyor

### 2. Satış Ekranı Stok/Ürün Listesi Sorunu  
**Dosya:** `project/frontend/pre-accounting-portal/src/features/sales-invoice/services/salesInvoiceService.ts`
**Sorun:** `fetchSalesItems()` fonksiyonu `disabled=0` filtresi ile çağrılıyor ama Item tablosunda `disabled` alanı string veya boolean olabilir
**Etki:** Ürün dropdown'ı boş görünüyor

### 3. Hata Yakalama Mekanizması
**Dosya:** `project/frontend/pre-accounting-portal/src/features/sales-invoice/hooks/useSalesInvoiceData.ts`
**Sorun:** `Promise.all` kullanımında `.catch(() => [])` tüm hataları sessizce yakalıyor, ayrıca veri yoksa atılan hata yakalanmıyor
**Etki:** Kullanıcı hata mesajı görmüyor

## Çözüm Planı

### Faz 29.1 - API Servis Düzeltmesi
- `fetchSalesCustomers()` - filtreleri kaldır veya doğrula
- `fetchSalesItems()` - disabled alan tipini kontrol et
- Error boundary ekle

### Faz 29.2 - Hook Düzeltmesi
- Loading state'i doğru yönet
- Hata mesajlarını kullanıcıya göster
- Retry mekanizması ekle

### Faz 29.3 - Test ve Doğrulama
- Playwright smoke test
- Manuel test senaryoları

## Değiştirilecek Dosyalar
- `project/frontend/pre-accounting-portal/src/features/sales-invoice/services/salesInvoiceService.ts`
- `project/frontend/pre-accounting-portal/src/features/sales-invoice/hooks/useSalesInvoiceData.ts`

## Kabul Kriterleri
- [ ] Yeni satış ekranında müşteri listesi dolu geliyor
- [ ] Yeni satış ekranında ürün listesi dolu geliyor
- [ ] API hatası durumunda kullanıcı bilgilendiriliyor
- [ ] Loading state doğru gösteriliyor