# Ön Muhasebe Faz 21 - Rol Bazlı Ekran Kısıtlama - 2026-05-05

## Kapsam
Tenant Admin'in kendi kullanıcılarına hangi ekranları göstereceğini/engelleyeceğini kontrol etmesi.
Backend API seviyesinde de yetki doğrulaması yapılır (UI gizleme tek başına yetki sayılmaz).

## Teknik Not
- Route yapısına `requiredRoles` ve `allowedTemplates` bilgisi eklenecek
- AppShell'de kullanıcının rollerine göre menü filtreleme
- Backend API'lerde rol kontrolü
- Sistem Yöneticisi tüm ekranlara erişir
- Rol şablonları: Muhasebe Sorumlusu, Satış Operasyon, Depo Sorumlusu, Yönetici, Salt Okuma

## Rol-Ekran Eşleşmesi
| Şablon | Erişebildiği Ekranlar |
|--------|----------------------|
| Sistem Yöneticisi | Tümü |
| Muhasebe Sorumlusu | Dashboard, Cari, Müşteriler, Ürünler, Satış, Tahsilat, Alış, Gider, Kasa/Banka, Raporlar, Gün Sonu |
| Satış Operasyon | Dashboard, Cari, Müşteriler, Ürünler, Satış, Tahsilat |
| Depo Sorumlusu | Dashboard, Stok, Ürünler |
| Yönetici | Tümü |
| Salt Okuma | Dashboard, Cari, Müşteriler, Ürünler, Satış, Tahsilat, Alış, Gider, Stok, Raporlar (salt görüntüleme) |

## Güvenlik Prensibi
- UI gizleme ≠ yetki
- Backend API tüm kritik işlemlerde rol kontrolü yapar
- Kullanıcı girişinde rol bilgisi fetch edilir

## Doğrulama
- `npm run -s build`
- Rol değişikliği sonrası menü güncellenmeli
