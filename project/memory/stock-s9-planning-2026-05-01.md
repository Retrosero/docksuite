# Stock S9 Planning (2026-05-01)

## Karar
S8 sonrasinda stok modulu teknik olarak guclu durumdadir. Bir sonraki faz, canli kullanim riskini azaltacak operasyonel hazirlik fazi olarak tanimlandi.

## S9 Faz Odagi
- Rol-bazli dogrulama disiplinini standartlastirmak
- Son kullaniciya ekran ici yonlendirme ile kullanim basarisini artirmak
- Canliya gecis sirasinda izleme/geri donus (rollback) netligini saglamak

## Adimlar

### S9.1 - Rol-Bazli E2E Smoke Checklist
- Rollere gore minimum kritik akislar:
  - Depo sorumlusu: stok gorunumu, transfer, sayim
  - Formen: material request olusturma ve durum takibi
  - Yonetici: KPI, audit, export kontrolu
- Her akis icin:
  - on kosul
  - adimlar
  - beklenen sonuc
  - hata durumunda triage notu
- Yarim otomatik komut seti:
  - frontend test/build
  - ERPNext API yetki/doctype erisim dogrulama listesi

### S9.2 - Ekran Ici Yardim Katmani
- StockScreen icinde "Kisa Kullanim Rehberi" bolumu
- Kritik panel hatalarinda ilgili dokumana yonlendirme
- Yeni personel onboarding dokumaniyla tutarli terminoloji

### S9.3 - Canliya Gecis Operasyon Paketi
- Izlenecek KPI esikleri:
  - ilk yukleme suresi
  - detay panel yukleme suresi
  - kritik stok oran trendi
  - reconciliation acik fark adedi
- Kisa rollback/incident runbook:
  - belirtiler
  - ilk kontrol noktasi
  - geri donus adimi
  - sorumluluk matrisi (ops/dev)

## Neden Bu Siralama
S9.1 tamamlanmadan ekran ici yardim ve canli paket dogru kalibre edilemez. Once gercek role gore dogrulama standardi tanimlanmalidir.

## Sonraki Uygulama Adimi
- `S9.1` implementasyonu: stok modulu icin rol-bazli smoke checklist dokumani + komut setinin olusturulmasi.
