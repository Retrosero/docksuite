# Ozluk Dosyasi Durum Spec'i

## Amac
Personel detay ekraninda ozluk dosyasi kapsamini gorunur hale getirmek:
- hangi zorunlu belge tipleri var,
- hangileri eksik,
- son yuklenen belgeler neler.

## Model Karari
Bu adimda `Employee + File` modeli kullanilir.

Neden:
- ERPNext `File` kayitlari zaten `Employee` kaydina dogrudan baglanabilir.
- Core'a dokunmadan hizli ve tenant-safe bir MVP cikar.
- Belgelerin var/yok ve son yukleme gorunurlugu icin ek tabloya zorunlu ihtiyac yok.

Bir sonraki adimda (`MVP-2`) `Employee Document Record` DocType planlanir:
- `document_type`
- `issue_date`
- `expiry_date`
- `status`
- `file_ref`
- `is_required`
- `note`

## Veri Kaynaklari
- `Employee` (personel karti)
- `File` (`attached_to_doctype = Employee`, `attached_to_name = <employee_id>`)

## MVP-1 Kapsami
1. Personel detay ekranina `Ozluk Dosyasi Durumu` karti eklenir.
2. Kontrol listesi (MVP zorunlu belge tipleri):
   - Kimlik Belgesi
   - Is Sozlesmesi
   - Saglik Raporu
   - ISG Egitim Belgesi
   - Mesleki Sertifika
3. Son yuklenen belgeler listesi (maksimum 6 belge).
4. Ozet metrik:
   - toplam belge sayisi
   - eksik belge sayisi

## Sinirlar
- Gecerlilik tarihi (`expiry`) takibi bu adimda yok.
- Belge onay/ret workflow'u bu adimda yok.
- Belge tipi siniflandirmasi dosya adindaki anahtar kelimelerle yapilir (MVP).

## API Plani
- `GET /api/resource/File`
  - fields: `name,file_name,file_url,is_private,creation`
  - filters:
    - `["attached_to_doctype","=","Employee"]`
    - `["attached_to_name","=", "<employee_id>"]`

## UI Plani
- `PersonnelDetailScreen` icinde yeni kart.
- Checklist satiri: belge tipi + durum etiketi (`Tamam` / `Eksik`).
- Belge listesi: dosya adi + belge tipi + yuklenme tarihi.
- Dosya item'i tiklandiginda yeni sekmede dosya acilir.

## Kabul Kriterleri
- Personel detayinda belge karti acilir.
- Dosya yoksa eksik durumlari gosterir.
- Dosya yuklendikce checklist otomatik olarak guncellenir.
- Build ve testler basarili olur.

