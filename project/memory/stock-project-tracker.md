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
- [ ] S5.3 `TODO` Uyari bazli hizli aksiyon akisi (talep/transfer shortcut)

## Aktif Adim
- `S5.3` (Uyari bazli hizli aksiyon akisi)

## Son Guncelleme
- 2026-04-27: `S5.2` tamamlandi. Aktif adim `S5.3` olarak guncellendi.
