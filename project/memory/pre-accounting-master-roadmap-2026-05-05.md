# Pre-Accounting Master Roadmap (2026-05-05)

## Hedef Kurgusu
SaaS + Cok Firma + Yetki Yonetimi tabanli on muhasebe uygulamasi.

### Temel Teknik Prensipler
- Tenant izolasyonu: Her firma ayrik site/veritabani.
- Ortak kod tabani: Tenant farklari plan + feature setting + rol ile yonetilir.
- Firma ici kullanici yonetimi: Tenant admin kendi kullanicilarini yonetir.
- Guvenlik: Permission + audit log + approval zinciri.

---

## Faz Siralamasi

### Tamamlanan Fazlar
| Faz | Konu | Tarih | Durum |
|-----|------|-------|-------|
| 1-19 | Core ozellikler | 2026-05-05 | Tamamlandi |
| 20 | Dashboard & Tahsilat ozet kartlari | 2026-05-05 | Tamamlandi |
| B' | Rol bazli ekran kisitlamasi | 2026-05-06 | Tamamlandi |
| C | Islem bazli yetki matrisi | 2026-05-06 | Tamamlandi |
| D | Onay akislari | 2026-05-06 | Tamamlandi |
| E | Onay durumunun belgeye yansimasi + timeline | 2026-05-06 | Tamamlandi |
| F | Onay rozetleri + pending kilidi | 2026-05-06 | Tamamlandi |
| G | Rol bazli dashboard + CSV/PDF rapor export | 2026-05-06 | Tamamlandi |
| H | SaaS operasyon katmani (provisioning/lisans/health-check) | 2026-05-06 | Tamamlandi |
| I | NES Portal API ile e-Belge entegrasyon katmani | 2026-05-06 | Tamamlandi |
| J | NES Portal Gelen/Giden Belge Merkezi + Webhook | 2026-05-06 | Tamamlandi |
| K | Mali Musavir ve Muhasebe Aktarim Merkezi | 2026-05-06 | Tamamlandi |
| A' | Tenant Onboarding Iyilestirmesi | 2026-05-06 | Tamamlandi |
| L | Dokumantasyon ve Entegrasyon Testleri | 2026-05-06 | Tamamlandi |
| M | Test Ortami ve Demo Data | 2026-05-06 | Tamamlandi |
| N | UI/UX Iyilestirmeleri (Loading/Error) | 2026-05-06 | Tamamlandi |

### Tamamlanma Ozeti

Toplam **18 Faz** tamamlandi:
- **Core**: Faz 1-19 (ERPNext temel moduller)
- **Portal**: Faz 20-28 (Dashboard, roller, onaylar)
- **SaaS**: Faz H-N (Multi-tenant, e-belge, aktarim, test)

### Sonraki Adim

Production readiness icin:
1. Gercek ortam testi (staging)
2. Performans optimizasyonu
3. Guvenlik audit
4. CI/CD pipeline

---

 
## Kritik Guvenlik Maddeleri
1. Tenant context zorunlulugu.
2. API tenant boundary zorunlulugu.
3. UI gizleme tek basina yetki degildir; backend de dogrular.
4. Finansal kritik aksiyonlarda audit log.
5. Tenant admin izolasyonu.

---

## Sonraki Adim
Production readiness: staging ortam, CI/CD pipeline ve guvenlik audit.
