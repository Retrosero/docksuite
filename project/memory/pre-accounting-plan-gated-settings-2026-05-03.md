# Ön Muhasebe Plan Kontrollü Ayarlar - 2026-05-03

## Yapılan
- Tenant config'e `plan` alanı eklendi.
- Ayar metadata tanımlarına `enabledPlans` listesi eklendi.
- Ayarlar ekranı geçerli tenant planını gösterir hale getirildi.
- Tenant planının kapsamadığı ayarlar pasif toggle olarak gösterildi.
- Plan uygunluğu için `isFeatureSettingEnabledForPlan` helper'ı ve test eklendi.

## Teknik Karar
- Plan kontrolü component içine dağılmadı; merkezi metadata helper üzerinden çözüldü.
- Bu fazda tenant planı statik config'ten okunuyor. Backend plan endpoint'i bağlandığında aynı `TenantConfig.plan` sözleşmesi korunabilir.
- Mobil hızlı tahsilat yalnızca `mobil` planında aktif edilebilir olarak işaretlendi.

## Sonraki Adım
- Tenant config'i Frappe backend'den okuyacak servis/hook eklenebilir.
- Backend `save_feature_setting` içinde plan kapsamı da doğrulanabilir.
