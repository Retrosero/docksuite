# Stock Project Tracker

## Kullanim
- Her gorev sonrasi bu dosyada sadece ilgili adimin durumu guncellenecek.
- Durum etiketleri:
  - `TODO`
  - `IN_PROGRESS`
  - `DONE`
  - `BLOCKED`

## Referans Spec
- `project/specs/stock/00-stock-advanced-product-spec.md`

## Faz ve Adimlar

### Faz S1 - Visibility Hardening
- [x] S1.1 `DONE` Stok service hardening (permission gate + fallback fields + tenant page-size)
- [x] S1.2 `DONE` Depo dagilim kartlari ve ozet metrikleri
- [x] S1.3 `DONE` Kritik stok risk hesap utility refactor

### Faz S2 - Request & Transfer
- [x] S2.1 `DONE` Material Request quick-create akisi
- [x] S2.2 `DONE` Stock Entry transfer quick-create akisi
- [x] S2.3 `DONE` Request/transfer durum rozetleri ve hata yonetimi

### Faz S3 - Reconciliation & Audit
- [x] S3.1 `DONE` Sayim fark analiz paneli
- [x] S3.2 `DONE` Stock Reconciliation olusturma akisi
- [x] S3.3 `DONE` Audit iz ozetleri

### Faz S4 - Procurement Link & KPI
- [x] S4.1 `DONE` Procurement baglanti gorunumu (PO/PR/PI)
- [x] S4.2 `DONE` Stock KPI ve rapor paneli
- [x] S4.3 `DONE` Performans tuning + rollout checklist

### Faz S5 - Alerting & Actionability
- [x] S5.1 `DONE` Uyari merkezi paneli (kritik/yaklasan/bilinmiyor + aksiyon listesi)
- [x] S5.2 `DONE` Tenant-config uyari esik yonetimi
- [x] S5.3 `DONE` Uyari bazli hizli aksiyon akisi (talep/transfer shortcut)

## Aktif Adim
- `S9.3` canliya gecis operasyon paketi (`TODO`)

### Faz S8 - Productization & Performance Depth
- [x] S8.1 `DONE` Stok detay panellerinde lazy-load chunk parcalama ve yukleme ayrimi
- [x] S8.2 `DONE` Performans olcum metrik paneli (ilk render, detay panel suresi, API gecikme)
- [x] S8.3 `DONE` Operasyonel export/rapor paketleme (CSV + tenant-safe satir limiti)

### Faz S9 - Go-Live Readiness & Operability
- [x] S9.1 `DONE` Rol-bazli E2E smoke checklist ve yarim otomatik dogrulama komutlari
- [x] S9.2 `DONE` Ekran ici yardim/egitim baglanti katmani
- [ ] S9.3 `TODO` Canliya gecis operasyon paketi (KPI esik + rollback/incident runbook)

### Faz S7 - Reliability, Performance, Rollout
- [x] S7.1 `DONE` Stok ekraninda panel bazli parcali yukleme + ilk gorunum performans iyilestirmesi
- [x] S7.2 `DONE` KPI/ileri rapor sorgularinda cache ve limit stratejisi (tenant-safe)
- [x] S7.3 `DONE` S6 ciktilari icin rollout/izleme checklist'i (hata, yetki, veri kalitesi)

### Faz S6 - Automation & Deep Analytics
- [x] S6.1 `DONE` Alert otomasyon kural modeli (event->aksiyon) + tenant config alanlari
- [x] S6.2 `DONE` Procurement action workflow paneli (talep/transfer/PO durum zinciri)
- [x] S6.3 `DONE` Ileri raporlama paneli (stok yaslanma, hareket sapmasi, acik risk drill-down)

## Son Guncelleme
- 2026-04-27: `S5.3` tamamlandi. S5 adimlari kapatildi.
- 2026-05-01: `S6` kapsam karari netlestirildi, `S6.1` aktif adim olarak baslatildi.
- 2026-05-01: `S6.1` tamamlandi (tenant alert otomasyon ayarlari + karar endpointi + ayar ekrani baglantisi).
- 2026-05-01: `S6.2` tamamlandi (procurement workflow paneli + faz bazli aksiyon onerisi + hizli talep/transfer).
- 2026-05-01: `S6.3` tamamlandi (ileri raporlama paneli + drill-down + test/build dogrulamasi).
- 2026-05-01: `S7` kapsami acildi, `S7.1` aktif adim olarak baslatildi.
- 2026-05-01: `S7.1` tamamlandi (detay panelleri istege bagli parcali yukleme + ilk gorunumde daha az API cagrisi).
- 2026-05-01: `S7.2` tamamlandi (KPI/procurement cache + tenant-safe query limitleri + force refresh uyumu).
- 2026-05-01: `S7.3` tamamlandi (rollout checklist paneli: yetki, API sagligi, veri kalitesi kontrolleri).
- 2026-05-01: `S8` kapsami acildi, `S8.1` tamamlandi (stok detay panelleri lazy-load chunk ayirimi).
- 2026-05-01: `S8.2` tamamlandi (performans olcum paneli: temel yukleme + detay panel sure metrikleri).
- 2026-05-01: `S8.3` tamamlandi (operasyonel CSV export paneli + tenant-safe satir limiti).
- 2026-05-01: `S9` kapsami planlandi; aktif adim `S9.1` olarak baslatildi.
- 2026-05-01: `S9.1` tamamlandi (rol-bazli stok smoke checklist dokumani + ortak test/build komutlari + triage notlari).
- 2026-05-01: `S9.2` tamamlandi (StockScreen kisa kullanim rehberi + hata durumunda smoke checklist yonlendirmesi).
