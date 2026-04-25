# IK Kurulum Merkezi Sayfa Spec'i

## Amac
IK kullanicisinin sirketlerde kullanilacak temel IK master verilerini tek ekranda kontrol etmesini, eksik kurulumlari gormesini ve basit kayitlari hizlica olusturmasini saglamak.

Bu sayfa ERPNext/HRMS cekirdegini kopyalamaz. Standart DocType verilerini resource API ile okur ve sade bir kullanici deneyimi sunar.

## ERPNext / HRMS Karsiligi
- `Company`
- `Branch`
- `Department`
- `Designation`
- `Employment Type`
- `Employee Grade`
- `Employee Group`
- `Holiday List`
- `Leave Type`
- `Leave Period`
- `Shift Type`
- `Payroll Period`
- `Employee`

## Sayfa Bolumleri
1. Ust ozet
   - Toplam sirket
   - Aktif personel
   - Organizasyon master durumu
   - Izin/vardiya/bordro kurulum durumu

2. Kurulum adimlari
   - Organizasyon
   - Izin
   - Vardiya
   - Bordro
   - Yetki

3. Veri kalite uyarilari
   - Departmansiz personel
   - Unvansiz personel
   - Tatil listesi eksigi
   - Izin tipi eksigi
   - Vardiya tipi eksigi
   - Bordro donemi eksigi

4. Master veri accordion listesi
   - Sirket
   - Sube
   - Departman
   - Unvan
   - Istihdam turu
   - Personel derecesi
   - Personel grubu
   - Izin tipi
   - Tatil listesi
   - Vardiya tipi
   - Bordro donemi

5. Hizli olusturma formu
   - Desteklenen ilk kayitlar: Sube, Departman, Unvan, Istihdam Turu, Personel Derecesi, Personel Grubu, Izin Tipi
   - Company, Holiday List, Shift Type ve Payroll Period daha fazla zorunlu alan gerektirdigi icin ilk surumde sadece listelenir.

## API Plani
Listeleme:
- `GET /api/resource/{DocType}?fields=[...]&limit_page_length=...`

Olusturma:
- `POST /api/resource/{DocType}`

Izin kontrolu:
- `frappe.client.has_permission` yardimcisi uzerinden `canReadDoctype`.

## Component Plani
- `HrSetupCenterPage`
- `HrSetupCenterScreen`
- `HrSetupSummaryCards`
- `HrSetupProgress`
- `DataQualityAlertList`
- `MasterDataAccordion`
- `MasterDataQuickCreateForm`

## UI Notlari
- Tumu Turkce olacak.
- Mobilde tek kolon kart ve accordion.
- Masaustunde sol tarafta kurulum/uyari, sag tarafta master veri ve hizli form.
- ERPNext teknik terimleri kullaniciya yalnizca gerekli yerde aciklayici alt metin olarak gosterilecek.
- Flowbite MIT desenlerine denk gelen button, badge, alert, accordion ve form davranisi kullanilacak; proje mevcut CSS standardi ile uygulanacak.

## Kabul Kriterleri
- `/ik-kurulum` route'u acilir.
- Sayfa login sonrasi menude `Yonetim` grubu altinda gorunur.
- Backend erisilemiyorsa sayfa Turkce hata mesaji verir.
- Standart master verileri resource API ile okunur.
- Veri kalite uyarilari UI tarafinda hesaplanir.
- Basit master veri ekleme formu kayit sonrasi veriyi yeniler.
- `npm run build` basarili olur.

