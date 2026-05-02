# Ön Muhasebe Faz 0 - Standard DocType Eşleme

## Amaç
Ön muhasebe portalındaki ilk modüllerin, ERPNext standard DocType'larla birebir eşlemesini netleştirmek.

Kural:
- Önce standart DocType kullanılır.
- Standart yapı yetmezse Custom Field düşünülür.
- Tekrar eden ayrı işlem geçmişi gerekiyorsa New DocType düşünülür.

## Modül -> DocType Eşleme

| Modül | Kullanım | Öncelikli DocType | Not |
|---|---|---|---|
| Dashboard | Özet kartlar ve hızlı durum | Sales Invoice, Purchase Invoice, Payment Entry, GL Entry, Bin | Hesaplama portalda yapılır, veri ERPNext'ten gelir |
| Cari | Müşteri/tedarikçi ve bakiye | Customer, Supplier, GL Entry | Cari özet için GL Entry filtreleri kullanılır |
| Satış ve Fatura | Satış faturası işlemleri | Sales Invoice, Sales Invoice Item, Customer, Item | İlk fazda teklif/sipariş opsiyonel |
| Tahsilat | Müşteri ödeme kaydı | Payment Entry, Mode of Payment, Account, Sales Invoice | Faturaya bağlı veya bağımsız tahsilat |
| Gider ve Ödeme | Alış/gider ve tedarikçi ödeme | Purchase Invoice, Payment Entry, Supplier, Account | Ödeme vadeleri Purchase Invoice üzerinden izlenir |
| Stok ve Ürün | Ürün kartı ve stok özeti | Item, Item Group, Warehouse, Bin, Stock Entry | Kritik stok görünümü ayar ile aç/kapa |
| Kasa/Banka | Nakit ve banka hareket özeti | Account, Payment Entry, Journal Entry, GL Entry | Transfer akışı sonraki faz |
| Raporlar | Sade karar raporları | Sales Invoice, Purchase Invoice, Payment Entry, GL Entry, Bin | Özel tablo kopyası tutulmaz |
| Ayarlar | Özellik ve görünürlük yönetimi | Single DocType (ürün ayarları), opsiyonel Product Plan/Tenant Product Config | Ayar anahtarları tenant seviyesinde yönetilir |

## İşlem Bazlı Eşleme

### Satış Faturası Oluşturma
- Kaynaklar: `Sales Invoice`, `Sales Invoice Item`, `Customer`, `Item`
- Beklenen API deseni:
  - `GET /api/resource/Sales Invoice` (liste)
  - `GET /api/resource/Sales Invoice/{name}` (detay)
  - `POST /api/resource/Sales Invoice` (oluşturma)
  - `PUT /api/resource/Sales Invoice/{name}` (güncelleme)

### Tahsilat Girişi
- Kaynaklar: `Payment Entry`, `Sales Invoice`, `Account`, `Mode of Payment`
- Beklenen API deseni:
  - `GET /api/resource/Payment Entry`
  - `POST /api/resource/Payment Entry`
  - `GET /api/resource/Sales Invoice` (açık fatura seçimleri)

### Gider/Alış Kaydı
- Kaynaklar: `Purchase Invoice`, `Supplier`, `Item`, `Account`
- Beklenen API deseni:
  - `GET /api/resource/Purchase Invoice`
  - `POST /api/resource/Purchase Invoice`

### Cari Bakiye Özeti
- Kaynaklar: `Customer`, `Supplier`, `GL Entry`
- Beklenen yaklaşım:
  - Cari kartı ve ilgili hareketler `GL Entry` filtreleriyle okunur.
  - Portal tarafında sadece gösterim için hesaplama yapılır.

### Stok Özeti
- Kaynaklar: `Item`, `Bin`, `Warehouse`
- Beklenen API deseni:
  - `GET /api/resource/Item`
  - `GET /api/resource/Bin` (item + warehouse bazında miktar)

## İlk Fazda Açılmaması Önerilen Custom Yapılar
Faz 0-1 için aşağıdaki alanlar hemen custom yapılmaz, ihtiyaç doğrulanınca değerlendirilir:
- satış temsilcisi özel etiket alanları
- müşteri segment özel alanları
- belge görsel şablon metadata alanları
- mobil hızlı tahsilat ekstra flag alanları

## Ayar Kontrollü Özellik Eşleme
Her modülden en az bir özellik ayar anahtarına bağlanmalıdır:
- Dashboard: `dashboard.show_overdue_receivables`
- Cari: `customer.show_balance_panel`
- Satış: `sales_invoice.show_discount_button`
- Tahsilat: `payment.allow_advance_payment`
- Stok: `stock.show_low_stock_alert`
- Mobil: `mobile.enable_quick_collection`

## Doğrulama Kontrolü
Bu eşleme tablosu kullanılırken:
1. İstenen ekran için önce standard DocType karşılığı var mı bakılır.
2. İlgili alanlar standard metadata içinde doğrulanır.
3. Standard yetmiyorsa custom kararı ayrı spec ile açılır.
4. Core'a dokunmadan custom app + frontend katmanında kalınır.
