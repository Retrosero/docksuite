# Stok Modulu Go-Live Operasyon Paketi

## Amac
Canliya gecis gununde stok modulu icin izleme, olay yonetimi ve geri donus adimlarini standartlastirmak.

## 1) Canli Oncesi Kontrol
- Son frontend dogrulamasi:
  - `npm test -- --run src/features/stock/services/stockService.spec.ts`
  - `npm run -s build`
- Rol-bazli smoke checklist tamamlandi mi:
  - `project/docs/erpnext/project-usage/stock-rol-bazli-smoke-checklist.md`
- Kritik API erisimleri role gore 200 donuyor mu (`Item`, `Bin`, `Material Request`, `Stock Entry`, `Stock Reconciliation`)?

## 2) Izlenecek KPI Esikleri (Ilk 7 Gun)
- Ilk ekran yukleme suresi (p95): `<= 2.5 sn`
- Detay panel yukleme suresi (p95): `<= 3.0 sn`
- Stok detay panel hata orani: `< 2%`
- Kritik stok orani ani artis alarmi: `gunluk +20%` ustu artis
- Reconciliation acik fark adedi alarmi: `> 30` kayit

## 3) Incident Triage Seviyeleri
- `SEV-1` (kritik):
  - Stok sayfasi acilmiyor veya transfer/talep olusturma tamamen durdu.
  - Hedef: 15 dakika icinde ilk geri bildirim.
- `SEV-2` (yuksek):
  - KPI/Audit/Export panellerinden biri surekli hata veriyor.
  - Hedef: 30 dakika icinde triage sonucu.
- `SEV-3` (orta):
  - Kismi veri tutarsizligi veya gecikme.
  - Hedef: ayni is gunu cozum plani.

## 4) Hizli Triage Akisi
1. Belirtiyi kaydet (hangi tenant, hangi rol, hangi panel/aksiyon).
2. Tarayici konsolu ve API status kodlarini kontrol et.
3. Yetki kontrolu yap (`canReadDoctype` / ilgili rol).
4. Tenant operational settings degerlerini dogrula (page-size, kritik limit vb).
5. Ayni akis test kullanicisi ile tekrar et.
6. Gecici cozum gerekiyorsa rollback karari ver.

## 5) Rollback Runbook (Kisa)
1. Son stabil `develop` commit hash'ini belirle.
2. Sorunlu deploy paketini geri al.
3. Uygulamayi stabil hash ile tekrar yayinla.
4. Smoke checklist'ten minimum akislari tekrar calistir.
5. Incident kaydina:
  - belirti
  - etki
  - kok neden hipotezi
  - kalici duzeltme aksiyonu
  ekle.

## 6) Sorumluluk Matrisi
- Operasyon:
  - incident acma
  - tenant etki alanini belirleme
  - ilk paydas bilgilendirmesi
- Gelistirme:
  - teknik triage
  - rollback / hotfix karari
  - kalici duzeltme plani

## 7) Kapanis Kriteri
- 7 gun boyunca SEV-1 yok.
- KPI esikleri stabil.
- Rol-bazli smoke checklist ardarda 2 tur basarili.
