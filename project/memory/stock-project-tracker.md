# Stock Project Tracker

## Kullanım
- Her görev sonrası bu dosyada sadece ilgili adımın durumu guncellenecek.
- Durum etiketleri:
  - `TODO`
  - `IN_PROGRESS`
  - `DONE`
  - `BLOCKED`

## Referans Spec
- `project/specs/stock/00-stock-advanced-product-spec.md`

## Faz ve Adımlar

### Faz S1 - Visibility Hardening
- [x] S1.1 `DONE` Stok service hardening (permission gate + fallback fields + tenant page-size)
- [x] S1.2 `DONE` Depo dagilim kartlari ve ozet metrikleri
- [x] S1.3 `DONE` Kritik stok risk hesap utility refactor

### Faz S2 - Request & Transfer
- [x] S2.1 `DONE` Material Request quick-create akisi
- [ ] S2.2 `IN_PROGRESS` Stock Entry transfer quick-create akisi
- [ ] S2.3 `TODO` Request/transfer durum rozetleri ve hata yonetimi

### Faz S3 - Reconciliation & Audit
- [ ] S3.1 `TODO` Sayim fark analiz paneli
- [ ] S3.2 `TODO` Stock Reconciliation olusturma akisi
- [ ] S3.3 `TODO` Audit iz ozetleri

### Faz S4 - Procurement Link & KPI
- [ ] S4.1 `TODO` Procurement baglanti gorunumu (PO/PR/PI)
- [ ] S4.2 `TODO` Stock KPI ve rapor paneli
- [ ] S4.3 `TODO` Performans tuning + rollout checklist

## Aktif Adım
- `S2.2` (Stock Entry transfer quick-create akisi)

## Son Güncelleme
- 2026-04-26: `S2.1` tamamlandi. Aktif adim `S2.2` olarak guncellendi.
