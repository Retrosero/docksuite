# Ön Muhasebe Faz 18 - Tedarikçi Kartı Oluşturma Spec

## Amaç
Cari ve alış süreçlerinde kullanılacak tedarikçi kartlarının ERPNext standardı bozulmadan hızlı oluşturulmasını sağlamak.

## Kapsam
- Cari ekranında ayar kontrollü `Yeni Tedarikçi` formu gösterilir.
- Form ERPNext `Supplier` DocType kaydı oluşturur.
- `Supplier Group` değerleri ERPNext lookup kaynağından alınır.
- Tedarikçi tipi ERPNext standart değerleriyle gönderilir: `Company`, `Individual`.
- Kayıt sonrası cari listesi yeniden yüklenir.

## Ayar
- key: `supplier.allow_quick_create`
- grup: `Cari`
- başlık: `Tedarikçi hızlı oluşturmayı aç`
- varsayılan: `true`
- kapsam: tenant
- plan: temel, ticari, mobil
- frontend davranışı: ayar açıksa cari ekranında hızlı tedarikçi formu render edilir
- backend davranışı: ayar anahtarı `pre_accounting_api` tarafında bilinir ve tenant planına göre doğrulanır
- mobil etkisi: mobil cari ekranında form tek kolonlu akışla kullanılabilir

## ERPNext Kaynakları
- `GET /api/resource/Supplier`
- `GET /api/resource/Supplier Group`
- `POST /api/resource/Supplier`
- `GET /api/resource/GL Entry`

## Kabul Kriterleri
- Kullanıcı cari ekranından yeni tedarikçi formunu açabilir.
- Tedarikçi adı, tipi ve grubu boşsa kayıt yapılmaz.
- Tedarikçi grubu listesi yüklenmeden kayıt butonu pasif kalır.
- Oluşturulan kayıt ERPNext `Supplier` kaynağına yazılır.
- Müşteri, tedarikçi ve ürün kartı oluşturma canlı kullanım kontrolünde birlikte değerlendirilir.
- Yeni DocType veya tenant özel sabit eklenmez.
