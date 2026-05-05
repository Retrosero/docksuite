# Pre-Accounting Master Roadmap (2026-05-05)

## Hedef Kurgusu
SaaS + Çok Firma + Yetki Yönetimi tabanlı ön muhasebe uygulaması.

### Temel Teknik Prensipler
- **Tenant İzolasyonu**: Her firma = ayrı site + ayrı veritabanı (cross-tenant yok)
- **Ortak Kod Tabanı**: Tenant farkları feature settings + plan + rol ile yönetilir
- **Firma İçi Kullanıcı Yönetimi**: Tenant Admin kullanıcı açar, rol verir, ekran/işlem yetkisi sınırlar
- **Güvenlik**: Permission + audit log + approval zinciri

---

## Faz Sıralaması

### ✅ Tamamlanan Fazlar
| Faz | Konu | Tarih | Durum |
|-----|------|-------|-------|
| 1-19 | Core Özellikler (Portal, Tahsilat, Dashboard, Cari, Kasa/Banka, Müşteri/Ürün/Tedarikçi, Kullanıcı Yönetimi) | 2026-05-05 | ✅ |
| 20 | Dashboard & Tahsilat Özet Kartları | 2026-05-05 | ✅ |

### 📋 Sıradaki Fazlar (Öncelik Sırasıyla)

#### 🔴 Faz B': Rol Bazlı Ekran Kısıtlaması (BAŞLANMADI)
Tenant Admin'in kendi kullanıcılarına hangi ekranları göstereceğini/engelleyeceğini kontrol etmesi.
- Feature flag tabanlı ekran görünürlüğü
- Backend API seviyesinde yetki kontrolü
- Gelecek faz: Kullanıcı başına özel kısıt

#### 🟡 Faz C: İşlem Bazlı Yetki Matrisi (BAŞLANMADI)
- Fatura kesme, iade, tahsilat, ödeme, mahsup, transfer için ayrı izin
- Tutar limiti bazlı kısıt: "10.000 TL üstü ödeme onayı gerekir"
- Belge durumuna göre yetki (taslak/kesilmiş/iptal)

#### 🟡 Faz D: Onay Akışları (BAŞLANMADI)
- Satış iskontosu, iade, yüksek tutarlı ödeme için onay zinciri
- 1 veya çok adımlı onay
- Onay bekleyen işler paneli

#### 🟢 Faz A': Tenant Onboarding İyileştirmesi (BAŞLANMADI)
- Plan seçimi ve modül aç/kapa akışı
- Tenant checklist ekranı
- İlk veri giriş rehberi

#### 🔵 Faz F: e-Belge ve Muhasebe Çekirdek (BAŞLANMADI)
- e-Belge hazırlık ve durum yönetimi
- Dönem kapanış kontrolleri
- Cari mutabakat, yaşlandırma, risk limitleri

#### 🟣 Faz G: Raporlama ve Yönetim Panelleri (BAŞLANMADI)
- Rol bazlı dashboard
- Tahsilat performansı, vade analizi, nakit akışı
- CSV/PDF export + plan bazlı rapor kapsamı

#### ⚫ Faz H: SaaS Operasyon Katmanı (BAŞLANMADI)
- Tenant provisioning otomasyonu
- Lisans/abonelik/limit yönetimi
- Destek/diagnostic araçları, health-check

---

## "Olmazsa Olmaz" Güvenlik Maddeleri

1. **Tenant Context Zorunluluğu**: Her istek tenant context ile çalışmalı
2. **API Tenant Boundary**: API seviyesinde tenant dışı kayıt erişimi kesin engellenmeli
3. **UI Gizleme Yetki DEĞİL**: UI gizleme tek başına yetki sayılmamalı; backend de doğrulamalı
4. **Audit Log**: Tüm finansal kritik aksiyonlar log'a düşmeli
5. **Tenant Admin İzolasyonu**: Firma yöneticisi kendi kullanıcılarını yönetebilmeli ama başka tenant'a dokunamamalı

---

## Teknik Notlar

### Backend Yetki Katmanları
```
1. frappe.session.user - Kimlik doğrulama
2. frappe.get_roles() - Rol kontrolü
3. Tenant boundary (site veritabanı izolasyonu)
4. Feature flag kontrolü
5. Custom permission check (DocType seviyesinde)
```

### Frontend Yetki Katmanları
```
1. featureFlags.ts - Modül bazlı görünürlük
2. settings prop - Sayfa seviyesinde kısıt
3. usePermission() hook - Aksiyon bazlı kontrol
4. Backend API çağrısında tekrar yetki kontrolü
```

---

## Sonraki Adım
Faz B' (Rol Bazlı Ekran Kısıtlaması) ile başlanması önerilir çünkü:
1. Faz 19'da kullanıcı yönetimi yapıldı
2. Güvenlik için UI + API kısıtlaması kritik
3. Diğer fazların temeli olacak
