# Ön Muhasebe Faz 10.4 - Ayar ve Plan Entegrasyonu - 2026-05-03

## Yapılan
- Yeni feature anahtarları eklendi:
  - `cash_bank.show_internal_transfer_panel`
  - `cash_bank.show_recent_transfer_list`
- Frontend `FeatureSettings`, metadata tanımları ve ayarlar grubu güncellendi.
- Ayarlar ekranına `Kasa/Banka` grubu eklendi.
- `CashBankScreen` transfer panel görünürlüğü ayar anahtarına bağlandı.
- `CashBankTransferPanel` son transfer listesi görünürlüğü ayar anahtarına bağlandı.
- Backend `pre_accounting_api` varsayılanları ve plan kısıtları yeni anahtarlarla genişletildi.

## Teknik Etki
- Transfer paneli tenant ayarıyla açılıp kapanabilir.
- Son transfer listesi panel içinde bağımsız şekilde yönetilebilir.
- Plan uyumsuz tenantlarda bu ayarlar backend tarafından doğrulanır.
