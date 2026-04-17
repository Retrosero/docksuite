# Current Custom Fields

## Active
### Item
- shipyard_secondary_aisle (Data) - Label: 2. Reyon
### Employee
- shipyard_monthly_base_salary (Currency) - Label: Aylik Temel Maas

## Candidate Fields (not created yet)

### Item
- shipyard_material_type (Select)
- shipyard_usage_zone (Data/Select)
- is_critical_stock (Check)

### Employee
- shipyard_team_ref (Link -> Team)
- shipyard_specialty (Select)

### Attendance
- shipyard_site_location (Data/Link)
- shipyard_shift_note (Small Text)

### Material Request
- shipyard_task_ref (Link -> Task)
- shipyard_request_priority (Select)

## Tenant-safe Notes
- Candidate fields are reusable product-level extensions, not single-company hardcoded fields.
- Any tenant-specific value list must be managed via configuration in later phases, not via hardcoded constants.
- `shipyard_secondary_aisle` active field is fixture-backed and can be reapplied across tenant sites.

## Validation Log
- 2026-04-12: `shipyard.localhost` üzerinde fixture yeniden uygulandý ve doðrulandý.
- `Item-shipyard_secondary_aisle` kaydý aktif.
- `tabItem.shipyard_secondary_aisle` kolonu mevcut.
- Alan meta: Label `2. Reyon`, Fieldname `shipyard_secondary_aisle`, Fieldtype `Data`, düzenlenebilir (`read_only=0`, `hidden=0`).
- Not: Bu alan fixture tabanlýdýr, yeni tenant site'larda `shipyard_app` kurulum + migrate ile tekrar uygulanýr.

## Task Integration Decisions (2026-04-13)

### Approved for implementation (when Task DocType is opened)
- Material Request.shipyard_task_ref (Link -> Task)
  - Reason: material talebini gorevle birebir baglamak icin gerekli minimum alan.

### Deferred (after Task first release)
- Field Report.task_ref and Task Progress.task_ref
  - Current state: Data field on custom doctypes.
  - Planned change: Link -> Task (Task DocType acildiktan sonra baglayici migration ile).
  - Reason: Task dogrudan baglandiginda raporlama butunlugu guclenecek.

### Not in this step
- Task icine yeni custom field eklenmeyecek.
  - Reason: Task DocType henuz acilmadi; once Task temel modeli netlesecek.
