# Ön Muhasebe Faz 19 - Kullanıcı ve Rol Yönetimi Spec

## Amaç
Her tenant şirketin kendi personelini ekleyebilmesi, rol şablonu ile yetki verebilmesi ve kullanıcıları aktif/pasif yönetebilmesi.

## Kapsam
- Yeni sayfa: `Kullanıcılar`
- Yeni ayar anahtarı: `security.enable_user_management_panel`
- Backend API:
  - `get_user_management_catalog`
  - `list_company_users`
  - `create_company_user`
  - `update_company_user_role_template`
  - `set_company_user_enabled`
- Rol şablonları:
  - Muhasebe Sorumlusu
  - Satış Operasyon
  - Depo Sorumlusu
  - Yönetici
  - Salt Okuma

## Güvenlik ve İzolasyon
- Her tenant ayrı site/veritabanı kullandığı için kullanıcı işlemleri mevcut site ile sınırlıdır.
- API sadece yetkili roller tarafından kullanılabilir (`System Manager`, `Accounts Manager`).
- `Administrator` ve `Guest` kullanıcıları API ile pasife alınamaz.
- Kullanıcı kendi hesabını pasife alamaz.

## Kabul Kriterleri
- Kullanıcılar ekranında yeni kullanıcı oluşturulabilir.
- Rol şablonu değişikliği kaydedilebilir.
- Kullanıcı aktif/pasif yapılabilir.
- Ayar kapalıysa panel pasif durum mesajı gösterir.
- Canlı kullanım kontrolünde kullanıcı/yetki paneli durumu ayrı maddede görünür.
