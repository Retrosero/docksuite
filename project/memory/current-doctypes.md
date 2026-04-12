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

## Custom (MVP Candidates - not created yet)
- Task
- Task Progress
- Technical Document Link

## Note
- Team DocType active as of 2026-04-12 after migrate and smoke validation on `shipyard.localhost`.
- Zimmet DocType active as of 2026-04-12 after migrate and smoke validation on `shipyard.localhost`.
- Field Report DocType active as of 2026-04-13 after migrate and smoke validation on `shipyard.localhost`.
