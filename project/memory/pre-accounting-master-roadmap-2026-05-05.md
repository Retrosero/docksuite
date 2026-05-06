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

### Siradaki Fazlar

#### Faz A' - Tenant Onboarding Iyilestirmesi (Beklemede)
- Plan secimi ve modul ac/kapa akisi
- Tenant checklist ekrani
- Ilk veri giris rehberi

#### Faz J - NES Portal Gelen/Giden Belge Merkezi (Beklemede)
- e-Fatura, e-Arsiv ve e-Irsaliye gelen/giden belge listeleri
- NES durum callback/webhook kayitlari
- Red, iptal, iade ve tekrar gonderim operasyonlari

#### Faz K - Mali Musavir ve Muhasebe Aktarim Merkezi (Beklemede)
- Luca, Zirve, Orka, Datasoft aktarim paketleri
- Donem bazli paket olusturma
- Aktarim gecmisi ve hata raporu

---

## Kritik Guvenlik Maddeleri
1. Tenant context zorunlulugu.
2. API tenant boundary zorunlulugu.
3. UI gizleme tek basina yetki degildir; backend de dogrular.
4. Finansal kritik aksiyonlarda audit log.
5. Tenant admin izolasyonu.

---

## Sonraki Adim
Faz J ile NES Portal gelen/giden belge merkezi ve callback tabanli durum senkronizasyonu urunlestirilmeli.
