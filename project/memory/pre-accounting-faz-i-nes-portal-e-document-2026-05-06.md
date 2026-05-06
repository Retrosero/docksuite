# Pre-Accounting Faz I - NES Portal e-Belge Katmani (2026-05-06)

## Kapsam
Resmi e-belge surecleri GIB'e dogrudan baglanmak yerine NES Portal API katmani uzerinden yonetilecek sekilde baslatildi.

## Yapilanlar
- Tenant bazli NES Portal ayar endpointleri eklendi.
- Sales Invoice uzerinde NES durum, UUID, son senkron ve hata alanlari custom field olarak tanimlandi.
- Kesilmis satis faturalarindan e-belge kuyrugu uretilir hale getirildi.
- Fatura gonderim ve durum sorgu aksiyonlari backend adapter uzerinden calisir hale getirildi.
- Ayarlar sayfasina NES Portal entegrasyon paneli eklendi.

## Teknik Notlar
- ERPNext finansal veri tek kaynak olarak kalir; fatura verisi ikinci yerde saklanmaz.
- Access token ayarlarda tutulur, frontend'e maskeli doner.
- Base URL, gonderim yolu ve durum yolu config ile yonetilir.
- NES'in verdigi Swagger/test ortami bilgileri geldikce endpoint path ve payload mapping ayni adaptor icinde daraltilebilir.

## Sonraki Faz
Faz J: Gelen/giden belge merkezi, callback/webhook kaydi, red/iptal/iade operasyonlari.
