# Team Module Spec

## Amaç
Ekipleri merkezi olarak tanımlamak ve görevler, attendance ve saha bildirimleri gibi yapılarda tekrar kullanmak.

## Neden önce?
- domain temelini güçlendirir
- diğer modüller için referans oluşturur
- basit ama ilişkisel bir örnektir

## Temel alanlar
- team_name
- team_code
- is_active
- team_lead (Employee link)
- specialty
- default_shift_type (Shift Type link)
- notes
- members (child table veya uygun ilişki yaklaşımı)

## Beklenen çıktı
- Team DocType
- gerekiyorsa Team Member child yapı kararı
- memory güncellemesi
- specs güncellemesi
- doğrulama notu
