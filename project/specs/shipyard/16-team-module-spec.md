# Team Module Spec

## Amac
Ekipleri merkezi olarak tanimlamak ve gorevler, attendance ve saha bildirimleri gibi yapilarda tekrar kullanmak.

## Neden once?
- domain temelini guclendirir
- diger moduller icin referans olusturur
- basit ama iliskisel bir ornektir

## Temel alanlar
- team_name
- team_code
- is_active
- team_lead (Employee link)
- specialty
- default_shift_type (Shift Type link)
- notes
- members (child table veya uygun iliski yaklasimi)

## Beklenen cikti
- Team DocType
- gerekiyorsa Team Member child yapi karari
- memory guncellemesi
- specs guncellemesi
- dogrulama notu

## Implementasyon Karari (2026-04-12)
- Team, New DocType olarak olusturuldu.
- Child table bu fazda eklenmedi.
- Gerekce:
  - Bu adimin hedefi minimum calisan Team modelini devreye almak.
  - Uyeler daha sonra `Employee.shipyard_team_ref` ile veya ayri `Team Member` iliski tablosuyla genisletilebilir.
  - Erken child table eklemek, bu fazda gereksiz karmasiklik ve erken bagimlilik olusturur.

## Dogrulama Notu (2026-04-12)
- Site: `shipyard.localhost`
- `bench --site shipyard.localhost migrate` basarili.
- Team DocType kaydi dogrulandi.
- Team kaydi olusturma smoke test basarili.
