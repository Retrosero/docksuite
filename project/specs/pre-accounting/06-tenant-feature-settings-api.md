# Ön Muhasebe Faz 9 - Tenant Ayar API

## Amaç
Ön muhasebe portalındaki opsiyonel ekran parçaları tenant/site seviyesinde yönetilebilir olmalıdır. Ayarlar ERPNext core değiştirilmeden Frappe site veritabanında saklanır.

## Kapsam
- Ayar anahtarları merkezi `DEFAULT_FEATURE_SETTINGS` sözleşmesiyle korunur.
- Backend yalnızca bilinen ayar anahtarlarını kabul eder.
- Ayar değeri boolean olmalıdır.
- Okuma endpoint'i mevcut tenant/site ayarını ürün varsayılanlarıyla birleştirir.
- Yazma endpoint'i oturum açmış kullanıcı gerektirir.
- Frontend ERP endpoint'i çalışmazsa yerel fallback ile geliştirme ve zayıf bağlantı deneyimini korur.

## Endpointler
- `shipyard_app.pre_accounting_api.get_feature_settings`
- `shipyard_app.pre_accounting_api.save_feature_setting`

## Saklama Modeli
- Kapsam: tenant/site
- Depo: Frappe global default kaydı
- Anahtar: `pre_accounting_feature_settings`
- Veri formatı: JSON boolean map

## Mobil ve React Native Hazırlığı
- Component'ler API çağrısı yapmaz.
- Ayar erişimi `settingsService` ve `useFeatureSettings` üzerinden yürür.
- Yerel saklama fallback olarak kalır; ileride React Native adapter ile değiştirilebilir.
- Ayar metadata tanımları merkezi `FEATURE_SETTING_DEFINITIONS` listesinde tutulur.
- Ayarlar ekranı grup, tenant kapsamı, plan kapsamı, yönetici rolleri ve mobil etki bilgisini aynı metadata üzerinden gösterir.

## Kabul Kriterleri
- Bilinmeyen ayar anahtarı backend tarafından reddedilir.
- Boolean olmayan değer backend tarafından reddedilir.
- Backend yanıtı eksik anahtar içerirse frontend ürün varsayılanlarını tamamlar.
- Ayarlar sayfası ERPNext Desk temasına bağlı kalmadan mevcut Türkçe mobil arayüz içinde çalışır.
- Her ayar için grup, plan kapsamı, yönetici rolü ve mobil etki tanımı bulunur.
