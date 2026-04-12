# New DocType Workflow Standardi

Bu dokuman, gercek feature implementasyonunda yeni DocType acma surecini standartlastirir.

## 1) Ne Zaman New DocType

Asagidaki durumlardan biri varsa New DocType dusunulur:
- Tekrarlayan islem gecmisi gerekiyor.
- Ayri liste/form/izin yapisi gerekiyor.
- Kayit yasam dongusu mevcut DocType'tan bagimsiz.
- Is akis adimlari veya durum gecmisi tutulacak.

Yalnizca mevcut kayda ek ozellik gerekiyorsa New DocType yerine Custom Field tercih edilir.

## 2) Isimlendirme Standardi

- DocType adi: acik, urun-genel ve tekrar kullanilabilir olmalidir.
- Tek tenant veya tek firma referansi isimde gecmez.
- Fieldname: snake_case, kucuk harf.
- Link alanlari: `<hedef>_ref` kalibiyla adlandirilir.

Ornek link alanlari:
- `employee_ref`
- `item_ref`
- `project_ref`
- `task_ref`

## 3) Child Table Degerlendirme Kurali

Child table kullan:
- Parent kayit icinde satir bazli tekrar varsa.
- Satirlar tek basina bagimsiz kayit gibi yonetilmiyorsa.

Ayri DocType kullan:
- Kaydin bagimsiz yetki/rapor/yaasam dongusu varsa.
- Parent'tan ayrik listeleme ve akis gerekiyorsa.

## 4) Standard DocType ile Iliski Kurma

- ERPNext standard kayitlarla `Link` uzerinden bag kurulur.
- Duplicate veri tutulmaz.
- Temel referanslar standard DocType'ta kalir (Employee, Item, Project vb.).
- Ozel DocType sadece yeni domain akisina ait veriyi tutar.

## 5) Multi-Tenant SaaS Prensipleri

- Veri modeli tenant bagimsiz urun modeli olmalidir.
- Tek firma ozel alan/surec kodu tasarima gomulmez.
- Tenant farkliliklari ayar ve workflow konfigurasyonu ile cozulur.
- Site bazli izolasyonla celisen ortak veri deposu tasarlanmaz.
- Kurulum tekrar edilmelidir: app + migration + fixture mantigi korunur.

## 6) Kontrol Listesi (Implementasyon Once)

1. New DocType karari gerekcelendirildi.
2. DocType adlandirmasi urun-genel yazildi.
3. Alan adlari standarda uygun yazildi.
4. Link alanlari `<hedef>_ref` kalibina cekildi.
5. Child table ihtiyaci acikca degerlendirildi.
6. Standard DocType iliskileri cizildi.
7. Multi-tenant checklist calistirildi.
8. Memory/specs guncelleme planlandi.