# IK Egitim Kilavuzu

## Amac
Bu dokuman, IK departmanina yeni katilan personelin sistemi hizli anlamasi ve gunluk islerini dogru sirayla yurutmesi icin hazirlandi.

## Sistem Ozeti
- Altyapi: ERPNext + HRMS + `shipyard_app`
- Kullanim modeli: her tenant (firma) kendi verisini izole sekilde kullanir
- Dil ve ekran yapisi: Turkce, mobil uyumlu, operasyon odakli

## Rol Bazli Kullanici Tipleri
- `IK`: personel, izin, belge, onboarding/offboarding, rapor
- `Yonetici`: onay ve KPI takibi
- `Calisan`: self-service islemleri (belge yukleme, izin/masraf talepleri)

## Ilk Gun Kurulum Kontrolu
1. Kullanici hesabinla giris yap.
2. Sol menude IK modullerinin gorundugunu dogrula.
3. `Ayarlar` ekraninda tenant bazli IK ayarlarini kontrol et:
   - izin turleri
   - departmanlar
   - otomatik izin tahsisi davranisi
   - zorunlu belge tipleri
4. Test amacli bir personel kaydi acip kaydet.

## IK'nin Gunluk Is Akisi
1. Personel kayitlarini kontrol et.
2. Yeni ise giris/isten cikis hareketlerini onboarding-offboarding ekranlarindan guncelle.
3. Izin ve mesai taleplerini kuyruktan kontrol et.
4. Eksik belge durumlarini `Ozluk Dosyasi` ve belge kayitlarindan takip et.
5. Gun sonu IK raporlarini kontrol et (acik talepler, devamsizlik, bekleyen onaylar).

## Moduller ve Ne Ise Yarar

## 1) Personel
- Yeni personel ekleme, duzenleme, detay guncelleme
- Departman ve unvan baglantisi
- Onboarding ozetinin personel detayinda goruntulenmesi

## 2) Izin Yonetimi
- Izin turleri tenant ayarindan yonetilir
- Talep olusturma/onay sureci izlenir
- Otomatik tahsis aciksa sistem eksik Leave Allocation kaydini olusturabilir

## 3) Mesai
- Mesai talepleri listelenir
- Onay akisi takip edilir
- Bordro oncesi mesai verisi kontrol edilir

## 4) Ozluk Dosyasi ve Belge Yonetimi
- `Employee Document Record` ile belge kaydi tutulur
- Zorunlu belge tipleri tenant ayarindan gelir
- Belge yukleme ve referans secimi self-service akisinda kullanilir

## 5) Onboarding / Offboarding
- Onboarding adimlari personel bazli takip edilir
- Offboarding surecinde teslim/zimmet ve kapanis adimlari izlenir

## 6) IK Raporlari
- Acik izin/mesai talepleri
- Attendance ve devamsizlik ozetleri
- Belgelerde eksik/son kullanimi gecen kayitlar

## Sik Kullanilan Ekranlar
- `Personel Listesi`
- `Personel Detay`
- `Izin Yonetimi`
- `Mesai`
- `IK Kurulum Merkezi`
- `IK Raporlari`
- `Calisan Paneli` (self-service)

## Hata ve Kontrol Noktalari
- Kayit olusturmadan once zorunlu alanlari kontrol et.
- Departman/izin turu adlarini tenant ayarindaki standartlarla ayni gir.
- Onay gerektiren kayitlarda durum rozetlerini takip et (`Open`, `Pending Approval`, `Submitted`).
- Belge tipi eslesmiyorsa once `Ayarlar` ekranindaki zorunlu belge tiplerini guncelle.

## Yeni Baslayanlar Icin 30 Dakikalik Egitim Plani
1. 5 dk: Sistem girisi ve menuler
2. 10 dk: Personel + izin + mesai temel akislari
3. 10 dk: Belge ve onboarding/offboarding akisi
4. 5 dk: IK raporlari ve gun sonu kontrol listesi

## Gun Sonu Kontrol Listesi
1. Bekleyen izin talepleri kontrol edildi mi?
2. Bekleyen mesai talepleri kontrol edildi mi?
3. Eksik belge listesi guncellendi mi?
4. Yeni onboarding/offboarding adimlari kayda alindi mi?
5. Kritik IK raporlarinda anomali var mi?

## Destek Notu
- Teknik hata alindiginda:
  - hangi ekran oldugu
  - hangi kullanici ile yapildigi
  - hangi adimda hata alindigi
  bilgisiyle birlikte destek kaydi acilmalidir.
