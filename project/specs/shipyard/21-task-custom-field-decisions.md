# Task Custom Field Decisions

## Scope
Bu adimda Task modulu icin hangi custom field'larin gerekli oldugu kararlastirildi.
Bu turda yeni custom field implementasyonu yapilmadi.

## Decision Summary (2026-04-13)

1. Material Request.shipyard_task_ref
- Type: Link
- Options: Task
- Status: Approved (Task DocType acildiktan sonra uygulanacak)
- Why: malzeme talebini gorevle dogrudan iliskilendirmek.

2. Material Request.shipyard_request_priority
- Type: Select
- Status: Keep as candidate
- Why: gorev baglaminda saha onceligi etiketlemek.

3. Field Report.task_ref and Task Progress.task_ref
- Current: Data
- Decision: Task DocType olustuktan sonra Link -> Task'a donusturulecek.
- Why: domain butunlugu ve sorgu performansi.

## SaaS / Tenant-safe Check
- Firma ozel hardcode yok.
- Tum kararlar urun-genel tekrar kurulabilir modelde.
- Link donusumleri Task olustuktan sonra migration ile yonetilecek.

## Next Execution Step
- Faz 1 toplu smoke testlerini calistir.
