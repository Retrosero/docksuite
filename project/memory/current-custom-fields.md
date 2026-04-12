# Current Custom Fields

## Active
- none yet

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
- These are analysis candidates only; no custom field was actually created in ERPNext at this stage.
