# Skill - Ayar Kontrollü Özellik Ekleme

## Amaç
Bir sayfaya eklenen yeni buton, panel, kolon, filtre veya işlemin ayarlar sayfasından göster/gizle ya da aktif/pasif yönetilebilir olmasını sağlamak.

## Ne zaman kullanılır?
- Yeni buton eklenirken
- Yeni panel veya kart eklenirken
- Listeye yeni kolon eklenirken
- Opsiyonel filtre eklenirken
- Tenant veya paket bazında açılıp kapanacak özellik eklenirken
- Mobilde ayrı aç/kapa davranışı gereken özellik eklenirken

## Adımlar
1. Özelliğin zorunlu mu opsiyonel mi olduğunu belirle.
2. Opsiyonelse ayar anahtarını tanımla.
3. Varsayılan değeri belirle.
4. Ayarlar sayfasındaki grup, başlık ve açıklamayı yaz.
5. Frontend'de görünürlük kontrolünü merkezi settings hook/service üzerinden yap.
6. Component içinde doğrudan hardcode koşul yazma.
7. Riskli işlemse backend tarafında da ayar/yetki kontrolü ekle.
8. Mobil etkisi varsa mobil ayar anahtarı veya aynı anahtarın mobil davranışını tanımla.
9. Spec ve memory dosyasına ayar anahtarını ekle.

## Ayar tanımı şablonu
- key:
- grup:
- Türkçe başlık:
- Türkçe açıklama:
- varsayılan:
- kapsam: tenant / rol / plan
- frontend davranışı:
- backend kontrolü:
- mobil etkisi:

## Örnek
- key: `sales_invoice.show_discount_button`
- grup: Satış ve Fatura
- Türkçe başlık: İskonto butonunu göster
- Türkçe açıklama: Satış faturası ekranında iskonto ekleme butonunu gösterir.
- varsayılan: false
- kapsam: tenant
- frontend davranışı: buton ayar açıksa render edilir
- backend kontrolü: iskonto uygulama endpoint'i yetki ve ayar kontrolü yapar
- mobil etkisi: mobil hızlı fatura ekranında aynı anahtar kullanılır
