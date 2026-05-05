# Ön Muhasebe Faz 24 - Tenant Onboarding İyileştirmesi - 2026-05-05

## Kapsam
Multi-tenant SaaS yapısı için tenant onboarding süreçlerinin iyileştirilmesi.

## Teknik Not
- Tenant kayıt akışı: subdomain + şirket bilgileri + ilk kullanıcı oluşturma
- Tenant konfigürasyonu: şirket logoları, renkler, özel Alanlar
- İlk veri seti oluşturma: varsayılan hesap planı, kullanıcı rolleri, vb.
- Onboarding checklist: kurulum sihirbazı ile adım adım yapılandırma

## Tenant Kayıt Akışı
1. Subdomain seçimi (şirketadi.docksuite.com)
2. Şirket bilgileri (ad, vergi no, adres)
3. İlk kullanıcı oluşturma (admin)
4. E-posta doğrulama
5. Kurulum sihirbazı (hesap planı, roller, ilk Para Birimi)

## Konfigürasyon Alanları
- Tenant ayarları DocType
- Varsayılan değerler: para birimi, vergi oranları, ödeme vadeleri
- Custom field tanımları: tenant bazlı alan ekleme
- Roller ve izinler: varsayılan rol şablonları

## Doğrulama
- `npm run -s build`
- Tenant kayıt akışı testi
