# Stock Advanced Product Spec (SaaS / Multi-Tenant)

## 1. Amac
Bu spec, tersane odakli SaaS urununde stok yonetimini ERPNext core'u bozmadan, mobile-first Turkce arayuzle ve tenant-config bazli olarak olgunlastirma planidir.

Hedef:
- stok gorunurlugu
- hareket dogrulugu
- kritik stok erken uyari
- satin alma ile senkron tedarik akisi
- depolar arasi transfer ve sayim disiplini

## 2. Kapsam

### In Scope
- Item/Bin bazli stok gorunumu
- depo bazli stok dagilimi
- kritik stok kurali (tenant-config)
- malzeme talep (Material Request) hazirlama ve takip
- depolar arasi transfer (Stock Entry)
- sayim/duzeltme (Stock Reconciliation)
- satin alma baglanti akisi (Purchase Order / Purchase Receipt / Purchase Invoice gorunum bagi)
- stok KPI ve risk paneli

### Out of Scope (bu planda)
- ERPNext core model degisikligi
- tek tenant'a ozel hardcode is kurallari
- WMS seviyesinde barkod cihaz entegrasyonu (ayri faz)

## 3. Kullanici Rolleri
- Depo Sorumlusu: stok takibi, transfer, sayim
- Formen: ekip bazli malzeme talebi
- Muhendis: ihtiyac planlama, kritik parca takip
- Yonetici: KPI, risk, stok maliyet resmi
- Satin Alma: talep->siparis->teslim izleme

## 4. Mevcut Durum (Referans)
- `/stok` sayfasi var (Item + Bin tabanli listeleme).
- kritik stok etiketi ve filtreleme MVP seviyesinde var.
- tenant operational settings icinde page-size vb alanlar aktif.

## 5. Mimari Kararlar

### 5.1 ERPNext Integrasyon
- Standart kaynaklar:
  - `Item`
  - `Bin`
  - `Warehouse`
  - `Material Request`
  - `Stock Entry`
  - `Stock Reconciliation`
  - `Purchase Order`
  - `Purchase Receipt`
  - `Purchase Invoice`
- Kural: once standart doctype/field, yetmezse custom field, en son yeni doctype.

### 5.2 Tenant-Config
- Stok davranislari `Tenant Settings` / `operational settings` uzerinden yonetilir.
- Ornek config alanlari:
  - `stock_list_page_size`
  - `dashboard_critical_stock_limit`
  - `stok_kritik_gun_esigi` (onerilen yeni)
  - `stok_default_warehouse` (onerilen yeni)
  - `stok_transfer_approval_required` (onerilen yeni)

### 5.3 Frontend Katmanlari
- Feature dizini: `src/features/stock/*`
- Service katmani:
  - yalniz veri cekme/donusum
- Hook katmani:
  - loading/error/state
- Component katmani:
  - UI ve etkileşim

## 6. Fonksiyonel Moduller

### M1 - Stock Visibility 2.0
- item, depo, grup, kritik durum, son hareket sinyali
- mobil kart + masaustu tablo
- filtre + siralama + arama

### M2 - Critical Stock Engine
- item kritik esitigi + lead-time gunu + tuketim hizi (kademeli)
- risk seviyesi:
  - kritik
  - yaklasan
  - normal
  - bilinmiyor (qty alinamazsa)
- dashboard ve stok sayfasina ortak servis

### M3 - Material Request Fast Flow
- stok ekranindan tek tikla `Material Request` taslagi
- ekip/gorev baglamiyla talep olusturma
- durum takibi: draft/open/partially ordered/ordered

### M4 - Warehouse Transfer Flow
- kaynak depo -> hedef depo transfer formu
- transfer satiri dogrulama (miktar/uygunluk)
- `Stock Entry` olusturma ve durum gostergesi

### M5 - Count & Reconciliation
- sayim listesi ve fark analizi
- duzeltme kaydi (`Stock Reconciliation`) olusturma
- denetim izi ve acik kapanis mantigi

### M6 - Procurement Link View
- kritik kalem icin:
  - acik talep
  - acik PO
  - beklenen receipt
  - son fatura
- satin alma modulu ile kopru gorunum

### M7 - Stock KPI & Reports
- toplam item sayisi
- kritik item sayisi
- dusuk stok degerine etki
- depo bazli dagilim
- donemsel hareket trendi

## 7. API Plani (Ilk Surum)
- `GET /api/resource/Item`
- `GET /api/resource/Bin`
- `GET /api/resource/Warehouse`
- `GET /api/resource/Material Request`
- `POST /api/resource/Material Request`
- `GET /api/resource/Stock Entry`
- `POST /api/resource/Stock Entry`
- `GET /api/resource/Stock Reconciliation`
- `POST /api/resource/Stock Reconciliation`
- `GET /api/resource/Purchase Order`
- `GET /api/resource/Purchase Receipt`
- `GET /api/resource/Purchase Invoice`
- `GET /api/method/shipyard_app.platform.api.get_operational_settings`

Not:
- Tum resource istekleri `canReadDoctype` ile permission-gated olmalidir.
- Alan farkliliklari icin fallback field-set stratejisi zorunludur.

## 8. Performans ve Dayaniklilik
- Liste endpointlerinde sayfa boyutu tenant-config ile sinirlanir.
- N+1 sorgu yerine toplu cekim ve map join uygulanir.
- Hata durumunda Turkce fail-safe mesajlar.
- Backend erisilemezse ekran fallback state ile acik kalir.

## 9. Guvenlik ve Yetki
- Role ve doctype yetkisi yoksa istek atilmaz.
- Kritik aksiyonlar:
  - transfer
  - sayim duzeltme
  - toplu talep
  icin explicit role denetimi.

## 10. Fazlar (Adim Adim Gelisim Plani)

### Faz S1 - Visibility Hardening
1. mevcut `/stok` servisini tenant-config + fallback alan seti ile sertlestir
2. depo dagilim kartlari
3. kritik stok hesap semasi netlestirme

### Faz S2 - Request & Transfer
4. material request quick-create
5. transfer quick-create (`Stock Entry`)
6. operasyonel onay akislari

### Faz S3 - Reconciliation & Audit
7. sayim/fark paneli
8. stock reconciliation kaydi
9. audit log ozet paneli

### Faz S4 - Procurement Link & KPI
10. procurement baglanti gorunumu
11. KPI/report paneli
12. performans optimizasyonu ve rollout checklist

### Faz S5 - Alerting & Actionability
13. uyari merkezi paneli (kritik/yaklasan/bilinmiyor)
14. tenant-config tabanli uyari esik yonetimi
15. uyari bazli hizli aksiyon akislari

### Faz S6 - Automation & Deep Analytics
16. alert otomasyon kurallari (event -> aksiyon) tasarimi ve tenant-config modeli
17. procurement action workflow (talep/transfer/PO takip durum gecisleri) paneli
18. ileri seviye raporlama (stok yaslanma, hareket sapmasi, kapanmayan risk) ve drill-down

## 11. Kabul Kriterleri
- ERPNext core degismeden tum akislar calisir.
- Tenant bazli config ile davranis farklari yonetilir.
- Mobilde ana stok aksiyonlari tek ekranda tamamlanir.
- Test/build ve smoke checklist tamamlanir.
- Memory + spec + git akis kayitlari her adimda guncellenir.

## 12. Ilk Uygulanacak Sonraki Adim
Ilk adim: **Faz S1 / Adim 1**  
`/stok` ekrani icin service-level hardening:
- permission gate
- fallback field set
- tenant-config page-size + kritik limit
- risk hesaplamasini ayrik utility'e tasima

## 13. Uygulama Durumu (2026-04-26)
- `S1.1` tamamlandi.
- `S1.2` tamamlandi.
- `S1.3` tamamlandi.
- `S2.1` tamamlandi.
- `S2.2` tamamlandi.
- `S2.3` tamamlandi.
- `S3.1` tamamlandi.
- `S3.2` tamamlandi.
- `S3.3` tamamlandi.
- `S4.1` tamamlandi.
- `S4.2` tamamlandi.
- `S4.3` tamamlandi.
- Stock advanced spec kapsamindaki S1-S4 adimlari tamamlandi.
- `S5.1` tamamlandi.
- `S5.2` tamamlandi.
- `S5.3` tamamlandi.
- S5 adimlari tamamlandi; sonraki faz S6 planlamasi.

## 14. S6 Kapsam Karari (2026-05-01)
- S6 odagi: alarm otomasyonu + aksiyon workflow + raporlama derinlestirme.
- S6 adimlari:
  - `S6.1` Alert otomasyon kural modeli ve tenant config alani tasarimi
  - `S6.2` Procurement action workflow paneli ve durum gecisleri
  - `S6.3` Ileri seviye raporlama paneli (yaslanma/sapma/acik risk)
- Faz gecis kurali: S6.1 tamamlanmadan S6.2'ye gecilmez.
- Durum: `S6.1`, `S6.2`, `S6.3` tamamlandi. Sonraki adim `S7` kapsam plani.

## 15. S7 Kapsam Karari (2026-05-01)
- S7 odagi: guvenilirlik, performans ve rollout kalitesi.
- S7 adimlari:
  - `S7.1` panel bazli parcali yukleme ve ilk gorunum hizlandirma
  - `S7.2` KPI/ileri rapor icin cache + sorgu limit stratejisi
  - `S7.3` rollout izleme checklist'i (yetki/hata/veri kalitesi)
- Faz gecis kurali: S7.1 kapanmadan S7.2 uygulama adimina gecilmez.
- Durum: `S7.1`, `S7.2`, `S7.3` tamamlandi. Sonraki adim `S8` kapsam plani.

## 16. S8 Kapsam Karari (2026-05-01)
- S8 odagi: urunlesme derinligi + performans olgunlastirma.
- S8 adimlari:
  - `S8.1` stok detay panelleri lazy-load chunk parcalama
  - `S8.2` performans olcum metrik paneli (render/API sureleri)
  - `S8.3` operasyonel export/rapor paketleme
- Durum: `S8.1`, `S8.2`, `S8.3` tamamlandi.
- S8.3 ciktilari:
  - Stok, reconciliation, procurement, KPI trend, audit ve ileri risk drill-down icin ayri CSV export aksiyonlari
  - Tenant-safe export satir limiti (`max 500`) ile tek export panelinde operasyonel paketleme
  - Export panelinin lazy yukleme akisi icindeki detay panellerine entegre edilmesi

## 17. S9 Kapsam Karari (2026-05-01)
- S9 odagi: canli kullanim hazirligi, dogrulama disiplini ve operasyonel sureklilik.
- S9 adimlari:
  - `S9.1` stok modulu icin rol-bazli E2E smoke checklist + yarim otomatik dogrulama komutlari
  - `S9.2` ekran ici yardim/egitim baglanti katmani (kisa kullanim akislari + hata durumunda yonlendirme)
  - `S9.3` canliya gecis operasyon paketi (izleme KPI esikleri + rollback/incident runbook ozeti)
- Faz gecis kurali: `S9.1` tamamlanmadan `S9.2` implementasyonuna gecilmez.
- Durum: `S9.1`, `S9.2`, `S9.3` tamamlandi. Sonraki adim `S10` planlamasi.

## 18. S10 Kapsam Karari (2026-05-01)
- S10 odagi: tenant-olcekli operasyon gorunurlugu ve otomasyon olgunlastirma.
- S10 adimlari:
  - `S10.1` tenant operasyon ozet paneli (uyari, kritik stok, acik reconciliation, son incident ozetleri)
  - `S10.2` alarm aksiyonlarini izlenebilir event kaydina baglama (aksiyon gecmisi / sonuc durumu)
  - `S10.3` denetim ve raporlama paketini tenant karsilastirma gorunumleriyle genisletme
- Faz gecis kurali: `S10.1` tamamlanmadan `S10.2` implementasyonuna gecilmez.
- Durum: `S10.1`, `S10.2`, `S10.3` tamamlandi. Sonraki adim `S11` planlamasi.

## 19. S11 Kapsam Karari (2026-05-01)
- S11 odagi: production hardening ve operasyon otomasyonu.
- S11 adimlari:
  - `S11.1` tenant health API ve dashboard besleme entegrasyonu
  - `S11.2` alert action event persistence (kalici ERP kaydi)
  - `S11.3` otomatik incident kurallari ve bildirim
- Faz gecis kurali: `S11.1` tamamlanmadan `S11.2` implementasyonuna gecilmez.
- Durum: `S11.1` tamamlandi, aktif adim `S11.2`.
