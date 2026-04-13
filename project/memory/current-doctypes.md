# Current DocTypes

## Standard
- Item
- Warehouse
- Material Request
- Stock Entry
- Purchase Order
- Project
- Employee
- Attendance
- Shift Type
- Leave
- Salary Structure
- Payroll Entry

## Custom (Active)
- Team
  - Purpose: Merkezi ekip tanimi
  - Fields: `team_name`, `team_code`, `is_active`, `team_lead`, `specialty`, `default_shift_type`, `notes`
  - Links: `team_lead -> Employee`, `default_shift_type -> Shift Type`
  - Child table: none (MVP'de gereksiz karmasiklik olusturmamak icin ertelendi)
  - Naming: `naming_rule = By fieldname`, field = `team_name`
- Zimmet
  - Purpose: Calisanlara verilen ekipman/malzeme teslim-iade takibi
  - Fields: `employee`, `item`, `quantity`, `delivery_date`, `return_date`, `return_status`, `delivered_by`, `note`
  - Links: `employee -> Employee`, `item -> Item`, `delivered_by -> Employee`
  - Child table: none (tek kayitli teslim/iade modeli ile MVP baslangici)
  - Naming: `autoname = hash`, `naming_rule = Random`
- Field Report
  - Purpose: Sahadan sorun/not/fotograf bildirimi toplamak
  - Fields: `task_ref`, `employee`, `report_datetime`, `description`, `photo`, `status`, `issue_type`, `has_issue`
  - Links: `employee -> Employee`
  - Child table: none (tek kayitli saha bildirimi modeli)
  - Naming: `autoname = hash`, `naming_rule = Random`
- Task Progress
  - Purpose: Gorev bazli ilerleme gecmisini zaman damgali kayitlarla tutmak
  - Fields: `task_ref`, `employee`, `progress_datetime`, `progress_percent`, `status`, `note`
  - Links: `employee -> Employee`
  - Child table: none (tek ilerleme olayini tek kayitla tutan model)
  - Naming: `autoname = hash`, `naming_rule = Random`
- Technical Document Link
  - Purpose: Gorev/proje/saha kaydi ile teknik dokuman bagini tutmak
  - Fields: `linked_type`, `linked_name`, `file_ref`, `document_url`, `revision_no`, `is_active`, `note`
  - Links: none (MVP'de bagli kayit tipi+id Data/Select ile tutuldu)
  - Child table: none
  - Naming: `autoname = hash`, `naming_rule = Random`
- System Log Entry
  - Purpose: Tenant bazli info/warning/error loglarini tutmak
  - Fields: `tenant_site`, `logged_at`, `severity`, `category`, `message`, `endpoint`, `http_method`, `user`, `reference_doctype`, `reference_name`, `status_code`, `details`, `traceback`
  - Links: `user -> User`, `reference_doctype -> DocType`
  - Child table: none
  - Naming: `autoname = hash`, `naming_rule = Random`
- Tenant Backup Request
  - Purpose: Tenant bazli manuel backup talep ve durum kaydini tutmak
  - Fields: `tenant_site`, `requested_at`, `request_mode`, `backup_scope`, `requested_by`, `status`, `backup_path`, `result_message`, `note`
  - Links: `requested_by -> User`
  - Child table: none
  - Naming: `autoname = hash`, `naming_rule = Random`

## Custom (MVP Candidates - not created yet)
- Task

## Note
- Team DocType active as of 2026-04-12 after migrate and smoke validation on `shipyard.localhost`.
- Zimmet DocType active as of 2026-04-12 after migrate and smoke validation on `shipyard.localhost`.
- Field Report DocType active as of 2026-04-13 after migrate and smoke validation on `shipyard.localhost`.
- Task Progress DocType active as of 2026-04-13 after migrate and smoke validation on `shipyard.localhost`.
- Technical Document Link DocType active as of 2026-04-13 after validate/smoke on `shipyard.localhost`.
- System Log Entry DocType active as of 2026-04-13 after stabilization-layer bootstrap.
- Tenant Backup Request DocType active as of 2026-04-13 after stabilization-layer bootstrap.
