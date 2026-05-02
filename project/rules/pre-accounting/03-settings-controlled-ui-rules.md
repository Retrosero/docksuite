# Ön Muhasebe Kuralları - Ayar Kontrollü UI

## Temel ilke
Sayfaya eklenen opsiyonel her panel, kolon, filtre, buton veya işlem ayarlar üzerinden yönetilebilir olmalıdır.

## Ne zaman ayar gerekir?
Aşağıdaki durumlardan biri varsa ayar anahtarı tanımlanır:
- özellik her tenant'ta açık olmayabilir
- özellik paket/plan bazında değişebilir
- kullanıcı rolüne göre göster/gizle yapılabilir
- müşteri ileride bu alanı kapatmak isteyebilir
- buton ekstra riskli veya opsiyonel bir işlem başlatıyorsa
- mobilde ayrı davranış gerekebiliyorsa

## Kurallar
1. Göster/gizle kararı component içinde hardcode edilmez.
2. Ayar anahtarı merkezi bir schema/listede tanımlanır.
3. Varsayılan değer ürün standardına göre belirlenir.
4. Ayar değişikliği tenant seviyesinde uygulanır.
5. Rol/yetki kontrolü ayar kontrolünün yerine geçmez; ikisi birlikte çalışır.
6. Ayar kapalıysa ilgili UI parçası render edilmez veya pasif gösterilir.
7. Kritik işlemlerde backend de ayar/yetki kontrolünü doğrular.
8. Ayarlar sayfasında kullanıcıya Türkçe, anlaşılır açıklama gösterilir.

## İsimlendirme standardı
Ayar anahtarı şu formatta olmalıdır:

`modul.sayfa_veya_akış.ozellik`

Örnekler:
- `dashboard.show_cash_summary`
- `customer.show_balance_panel`
- `sales_invoice.show_discount_button`
- `sales_invoice.allow_draft_save`
- `payment.allow_advance_payment`
- `stock.show_low_stock_alert`
- `mobile.enable_quick_collection`

## Ayarlar sayfası grupları
- Dashboard
- Cari
- Satış ve Fatura
- Tahsilat
- Gider ve Ödeme
- Stok
- Raporlar
- Mobil
- Marka ve Görünüm
