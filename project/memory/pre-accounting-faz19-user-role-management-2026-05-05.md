# Ön Muhasebe Faz 19 - Kullanıcı ve Rol Yönetimi - 2026-05-05

## Kapsam
- Kullanıcılar ekranı eklendi.
- Tenant içi kullanıcı oluşturma, rol şablonu atama ve aktif/pasif yönetimi eklendi.
- `security.enable_user_management_panel` ayarı frontend ve backend ayar listesine eklendi.
- Canlı kullanım kontrolüne erişim kontrol maddesi eklendi.

## Teknik Not
- Backend tarafında yeni modül: `pre_accounting_user_api.py`
- Kullanıcı yönetim işlemleri `User` DocType üzerinde standart Frappe kayıtlarıyla yürütülür.
- Yönetilen roller dışındaki mevcut roller korunur; sadece şablon kapsamındaki roller değiştirilir.

## Doğrulama
- `npm test -- --run`
- `npm run test:e2e`
- `npm run -s build`
