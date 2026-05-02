# Ön Muhasebe Ürün Başlangıç Notu - 2026-05-02

## Kapsam
Yeni ön muhasebe SaaS ERP ürünü için ilk ürün spec'i, domain kuralları ve skills dosyaları eklendi.

## Kararlar
- ERPNext/Frappe core değiştirilmeyecek.
- Özel backend geliştirmeleri ileride `pre_accounting_app` custom app içinde yapılacak.
- Frontend için önerilen klasör `project/frontend/pre-accounting-portal`.
- Ürün tamamen Türkçe ve mobile-first geliştirilecek.
- React Native'e taşınabilirlik için domain servisleri, TypeScript tipleri ve validasyonlar UI framework'ünden ayrılacak.
- Her müşteri ayrı Frappe site/veritabanı ile çalışacak; kod tabanı ortak kalacak.
- Opsiyonel buton/panel/kolon/filtre/işlem özellikleri ayarlar sayfasından yönetilebilir olacak.

## Eklenen dosyalar
- `project/specs/pre-accounting/00-product-spec.md`
- `project/rules/pre-accounting/00-product-rules.md`
- `project/rules/pre-accounting/01-erpnext-integration-rules.md`
- `project/rules/pre-accounting/02-mobile-react-native-rules.md`
- `project/rules/pre-accounting/03-settings-controlled-ui-rules.md`
- `project/skills/pre-accounting/design-module-from-request.md`
- `project/skills/pre-accounting/settings-controlled-feature-skill.md`

## Sonraki adım
Faz 0 devamı olarak ERPNext standard DocType eşleme tablosu ve ilk portal iskeleti spec'i hazırlanmalıdır.
