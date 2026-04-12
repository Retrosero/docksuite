# Phase 2 - Admin and Back-Office Usability

## Amac
ERPNext tarafinda custom DocType'lari admin ve arka ofis kullanicilari icin yonetilebilir hale getirmek.

## Kapsam
- Team
- Zimmet
- Field Report
- Task Progress
- Technical Document Link
- iliski alanlari ve list view kullanilabilirligi
- ornek veri ile smoke test

## Bu Fazda Beklenen Davranis
1. DocType'lar ERPNext UI uzerinden acilip kaydedilebilir olmali.
2. Temel link alanlari dogru kaynaklara baglanmali.
3. Liste gorunumu ve title/search alanlari pratik kullanim saglamali.
4. Admin seviyesinde one-off manuel islemler ERPNext ekranlari icinde kalmali.

## Dogrulanacak Iliskiler
- Team.team_lead -> Employee
- Team.default_shift_type -> Shift Type
- Zimmet.employee -> Employee
- Zimmet.item -> Item
- Field Report.employee -> Employee
- Task Progress.employee -> Employee
- Technical Document Link.linked_type -> urun-genel baglanti tipi

## Smoke Bundle
- Team kaydi
- Zimmet kaydi
- Field Report kaydi
- Task Progress kaydi
- Technical Document Link kaydi

## Faz Disi Birakilanlar
- shipyard-portal frontend
- tenant ozel branding
- permission matrix yeniden tasarimi
- core ERPNext degisiklikleri

## Kabul Kriterleri
- metadata kontrolu basarili
- relation flow kontrolu basarili
- smoke bundle calisabilir
- docs ve memory guncel

## Not
Bu faz, yeni bir UI katmani yazmaktan cok mevcut ERPNext UI'nin operasyonel kullanilabilirligini netlestirir.
