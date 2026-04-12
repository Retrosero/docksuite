# Feature Decision Template

Bu mini sablon, yeni istek geldiginde karar vermek ve implementasyon yolunu standarda baglamak icin kullanilir.

## 1) Istek Ozeti
- Istek:
- Is hedefi:
- Beklenen cikti:

## 2) Etkilenen Ekran / Modul
- Ekran(lar):
- Modul(ler):
- Hedef kullanici rol(ler)i:

## 3) Standard Alan Kontrolu
- Ilgili standard DocType(lar):
- Mevcut standard alanlar yeterli mi? (Evet/Hayir)
- Eksik kalan alan(lar):

## 4) Sadece UI Degisikligi mi?
- Sadece ekran duzenleme/metin/akýs iyilestirmesi mi? (Evet/Hayir)
- Veri modeli degisiyor mu? (Evet/Hayir)

## 5) Karar: Custom Field mi, New DocType mi?
- Karar:
- Gerekce:
- Alternatif neden elendi:

## 6) Custom Field Detayi (Varsa)
- Hedef DocType:
- Fieldname (`shipyard_...`):
- Label (Turkce):
- Fieldtype:
- Fixture'e alinacak mi? (Evet/Hayir)

## 7) New DocType Detayi (Varsa)
- DocType adi:
- Ana alanlar:
- Link alanlari (`<hedef>_ref`):
- Child table ihtiyaci: (Var/Yok + gerekce)

## 8) Multi-Tenant / SaaS Kontrolu
- Tek firmaya ozel sabit var mi? (Evet/Hayir)
- Tenant farkliligi config ile cozuldu mu? (Evet/Hayir)
- Site izolasyonu guvende mi? (Evet/Hayir)

## 9) Memory Guncelleme Karari
- `current-custom-fields.md` guncellenecek mi? (Evet/Hayir)
- `current-doctypes.md` guncellenecek mi? (Evet/Hayir)
- Gerekce:

## 10) Specs Guncelleme Karari
- Hangi specs dosyasi guncellenecek?
- Hangi karar/gerekce eklenecek?

## 11) Git Plani
- Branch adi: `feature/<kisa-konu>`
- Commit mesaji taslagi:
- Develop merge zamani:

## 12) Uygulama Sonu Kontrol
- Implementasyon tamamlandi mi?
- Memory/specs guncellendi mi?
- Git adimlari tamamlandi mi?