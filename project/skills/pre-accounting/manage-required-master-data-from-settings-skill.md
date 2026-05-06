# Skill - Ayarlar Sayfasından Zorunlu Master Veri Yönetimi

## Amaç
Ön muhasebe menülerinde form açılışını veya kayıt oluşturmayı bloklayan zorunlu lookup/master verileri (`Müşteri Grubu`, `Bölge`, `Tedarikçi Grubu`, `Ürün Grubu`, `Stok Birimi`, `Ödeme Yöntemi`) tek noktadan `Ayarlar` sayfasında yönetilebilir tutmak.

## Ne zaman kullanılır?
- Formda "liste yüklenmeden kayıt oluşturulamaz" uyarısı varsa
- Yeni tenant/site kurulumunda temel kataloglar eksikse
- Kullanıcı "zorunlu alanları ayarlardan yönetmek istiyorum" diyorsa
- Yeni bir menü, ek master veri bağımlılığı getiriyorsa

## Zorunlu yaklaşım
1. Zorunlu lookup kaynaklarını önce tespit et:
   - `Customer Group`
   - `Territory`
   - `Supplier Group`
   - `Item Group`
   - `UOM`
   - `Mode of Payment`
2. `Ayarlar` ekranında durum paneli göster:
   - kayıt adedi
   - hazır/eksik durumu
   - örnek kayıtlar
3. `Ayarlar` ekranından quick-create ekle:
   - kayıt türü seçimi
   - kayıt adı
   - gerekiyorsa üst kayıt (tree DocType)
4. Form ekranlarında eksik lookup uyarılarını `Ayarlar > Zorunlu Master Veri Yönetimi` bölümüne yönlendir.
5. Yeni master veri ihtiyacında aynı modeli genişlet:
   - merkezi definition listesi
   - tek servis katmanından okuma/oluşturma

## Teknik uygulama şablonu
- `features/settings/services/masterDataSettingsService.ts`
  - `REQUIRED_MASTER_DATA_DEFINITIONS`
  - `fetchRequiredMasterDataStatuses`
  - `fetchParentOptions`
  - `createRequiredMasterDataEntry`
- `features/settings/components/SettingsScreen.tsx`
  - "Zorunlu Master Veri Yönetimi" paneli
  - hazır/eksik görünümü
  - quick-create formu

## SaaS / Multi-tenant kontrol
- Tenant'a özel sabit değer kod içine gömülmez.
- Doctype bağımlılıkları ürün genelinde tekrar kullanılabilir tutulur.
- Formlar eksik lookup yüzünden bloke oluyorsa çözüm `Ayarlar` panelinden yapılır, geçici hardcode ile değil.

## Kabul kriterleri
- Zorunlu lookup master verileri ayarlardan oluşturulabiliyor olmalı.
- İlgili menülerde eksik veride kullanıcı nereye gitmesi gerektiğini açık görmeli.
- `lint`, `test`, `build` yeşil olmalı.
