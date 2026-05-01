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
- `S7` planlama (`TODO`)

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
