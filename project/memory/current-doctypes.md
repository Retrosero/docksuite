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

## Custom (MVP Candidates - not created yet)
- Task
- Zimmet
- Field Report
- Task Progress
- Technical Document Link

## Note
- Team DocType active as of 2026-04-12 after migrate and smoke validation on `shipyard.localhost`.
