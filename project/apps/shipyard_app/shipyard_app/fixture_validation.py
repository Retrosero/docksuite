import frappe
from frappe.utils import now_datetime


def ensure_team_doctype():
    """Create Team as a custom DocType when missing."""
    if frappe.db.exists("DocType", "Team"):
        return {"created": False, "name": "Team"}

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": "Team",
            "module": "Shipyard App",
            "custom": 1,
            "autoname": "field:team_name",
            "naming_rule": "By fieldname",
            "title_field": "team_name",
            "search_fields": "team_name,team_code",
            "track_changes": 1,
            "fields": [
                {
                    "fieldname": "team_name",
                    "label": "Ekip Adi",
                    "fieldtype": "Data",
                    "reqd": 1,
                    "in_list_view": 1,
                },
                {
                    "fieldname": "team_code",
                    "label": "Ekip Kodu",
                    "fieldtype": "Data",
                    "reqd": 1,
                    "unique": 1,
                    "in_list_view": 1,
                },
                {
                    "fieldname": "is_active",
                    "label": "Aktif",
                    "fieldtype": "Check",
                    "default": "1",
                },
                {
                    "fieldname": "team_lead",
                    "label": "Ekip Lideri",
                    "fieldtype": "Link",
                    "options": "Employee",
                },
                {
                    "fieldname": "specialty",
                    "label": "Uzmanlik",
                    "fieldtype": "Data",
                },
                {
                    "fieldname": "default_shift_type",
                    "label": "Varsayilan Vardiya Tipi",
                    "fieldtype": "Link",
                    "options": "Shift Type",
                },
                {
                    "fieldname": "notes",
                    "label": "Notlar",
                    "fieldtype": "Small Text",
                },
            ],
            "permissions": [
                {
                    "role": "System Manager",
                    "read": 1,
                    "write": 1,
                    "create": 1,
                    "delete": 1,
                    "share": 1,
                    "print": 1,
                    "email": 1,
                    "report": 1,
                    "export": 1,
                }
            ],
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": doc.name}


def ensure_zimmet_doctype():
    """Create Zimmet as a custom DocType when missing."""
    if frappe.db.exists("DocType", "Zimmet"):
        return {"created": False, "name": "Zimmet"}

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": "Zimmet",
            "module": "Shipyard App",
            "custom": 1,
            "autoname": "hash",
            "naming_rule": "Random",
            "title_field": "employee",
            "search_fields": "employee,item,return_status",
            "track_changes": 1,
            "fields": [
                {
                    "fieldname": "employee",
                    "label": "Calisan",
                    "fieldtype": "Link",
                    "options": "Employee",
                    "reqd": 1,
                    "in_list_view": 1,
                },
                {
                    "fieldname": "item",
                    "label": "Urun/Malzeme",
                    "fieldtype": "Link",
                    "options": "Item",
                    "reqd": 1,
                    "in_list_view": 1,
                },
                {
                    "fieldname": "quantity",
                    "label": "Miktar",
                    "fieldtype": "Float",
                    "reqd": 1,
                    "default": "1",
                },
                {
                    "fieldname": "delivery_date",
                    "label": "Teslim Tarihi",
                    "fieldtype": "Date",
                    "reqd": 1,
                    "in_list_view": 1,
                },
                {
                    "fieldname": "return_date",
                    "label": "Iade Tarihi",
                    "fieldtype": "Date",
                },
                {
                    "fieldname": "return_status",
                    "label": "Iade Durumu",
                    "fieldtype": "Select",
                    "options": "Teslim Edildi\nKismi Iade\nTam Iade",
                    "default": "Teslim Edildi",
                    "in_list_view": 1,
                },
                {
                    "fieldname": "delivered_by",
                    "label": "Teslim Eden",
                    "fieldtype": "Link",
                    "options": "Employee",
                },
                {
                    "fieldname": "note",
                    "label": "Not",
                    "fieldtype": "Small Text",
                },
            ],
            "permissions": [
                {
                    "role": "System Manager",
                    "read": 1,
                    "write": 1,
                    "create": 1,
                    "delete": 1,
                    "share": 1,
                    "print": 1,
                    "email": 1,
                    "report": 1,
                    "export": 1,
                }
            ],
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": doc.name}


def ensure_field_report_doctype():
    """Create Field Report as a custom DocType when missing."""
    if frappe.db.exists("DocType", "Field Report"):
        return {"created": False, "name": "Field Report"}

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": "Field Report",
            "module": "Shipyard App",
            "custom": 1,
            "autoname": "hash",
            "naming_rule": "Random",
            "title_field": "employee",
            "search_fields": "employee,status,issue_type",
            "track_changes": 1,
            "fields": [
                {
                    "fieldname": "task_ref",
                    "label": "Gorev",
                    "fieldtype": "Data",
                },
                {
                    "fieldname": "employee",
                    "label": "Calisan",
                    "fieldtype": "Link",
                    "options": "Employee",
                    "reqd": 1,
                    "in_list_view": 1,
                },
                {
                    "fieldname": "report_datetime",
                    "label": "Tarih/Saat",
                    "fieldtype": "Datetime",
                    "reqd": 1,
                    "in_list_view": 1,
                },
                {
                    "fieldname": "description",
                    "label": "Aciklama",
                    "fieldtype": "Small Text",
                    "reqd": 1,
                },
                {
                    "fieldname": "photo",
                    "label": "Fotograf",
                    "fieldtype": "Attach",
                },
                {
                    "fieldname": "status",
                    "label": "Durum",
                    "fieldtype": "Select",
                    "options": "Acik\nInceleniyor\nKapatildi",
                    "default": "Acik",
                    "in_list_view": 1,
                },
                {
                    "fieldname": "issue_type",
                    "label": "Sorun Tipi",
                    "fieldtype": "Data",
                },
                {
                    "fieldname": "has_issue",
                    "label": "Sorun Var Mi",
                    "fieldtype": "Check",
                    "default": "0",
                },
            ],
            "permissions": [
                {
                    "role": "System Manager",
                    "read": 1,
                    "write": 1,
                    "create": 1,
                    "delete": 1,
                    "share": 1,
                    "print": 1,
                    "email": 1,
                    "report": 1,
                    "export": 1,
                }
            ],
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": doc.name}


def ensure_task_progress_doctype():
    """Create Task Progress as a custom DocType when missing."""
    if frappe.db.exists("DocType", "Task Progress"):
        return {"created": False, "name": "Task Progress"}

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": "Task Progress",
            "module": "Shipyard App",
            "custom": 1,
            "autoname": "hash",
            "naming_rule": "Random",
            "title_field": "task_ref",
            "search_fields": "task_ref,status,progress_percent",
            "track_changes": 1,
            "fields": [
                {
                    "fieldname": "task_ref",
                    "label": "Gorev",
                    "fieldtype": "Data",
                    "reqd": 1,
                    "in_list_view": 1,
                },
                {
                    "fieldname": "employee",
                    "label": "Calisan",
                    "fieldtype": "Link",
                    "options": "Employee",
                    "in_list_view": 1,
                },
                {
                    "fieldname": "progress_datetime",
                    "label": "Ilerleme Tarih/Saat",
                    "fieldtype": "Datetime",
                    "reqd": 1,
                    "in_list_view": 1,
                },
                {
                    "fieldname": "progress_percent",
                    "label": "Ilerleme Yuzdesi",
                    "fieldtype": "Percent",
                    "default": "0",
                    "reqd": 1,
                },
                {
                    "fieldname": "status",
                    "label": "Durum",
                    "fieldtype": "Select",
                    "options": "Baslamadi\nDevam Ediyor\nBeklemede\nTamamlandi",
                    "default": "Devam Ediyor",
                    "in_list_view": 1,
                },
                {
                    "fieldname": "note",
                    "label": "Not",
                    "fieldtype": "Small Text",
                },
            ],
            "permissions": [
                {
                    "role": "System Manager",
                    "read": 1,
                    "write": 1,
                    "create": 1,
                    "delete": 1,
                    "share": 1,
                    "print": 1,
                    "email": 1,
                    "report": 1,
                    "export": 1,
                }
            ],
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": doc.name}


def ensure_technical_document_link_doctype():
    """Create Technical Document Link as a custom DocType when missing."""
    if frappe.db.exists("DocType", "Technical Document Link"):
        return {"created": False, "name": "Technical Document Link"}

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": "Technical Document Link",
            "module": "Shipyard App",
            "custom": 1,
            "autoname": "hash",
            "naming_rule": "Random",
            "title_field": "linked_name",
            "search_fields": "linked_type,linked_name,revision_no",
            "track_changes": 1,
            "fields": [
                {
                    "fieldname": "linked_type",
                    "label": "Bagli Tip",
                    "fieldtype": "Select",
                    "options": "Task\nProject\nField Report",
                    "reqd": 1,
                    "in_list_view": 1,
                },
                {
                    "fieldname": "linked_name",
                    "label": "Bagli Kayit",
                    "fieldtype": "Data",
                    "reqd": 1,
                    "in_list_view": 1,
                },
                {
                    "fieldname": "file_ref",
                    "label": "Dokuman Dosyasi",
                    "fieldtype": "Attach",
                },
                {
                    "fieldname": "document_url",
                    "label": "Dokuman URL",
                    "fieldtype": "Data",
                },
                {
                    "fieldname": "revision_no",
                    "label": "Revizyon No",
                    "fieldtype": "Data",
                    "in_list_view": 1,
                },
                {
                    "fieldname": "is_active",
                    "label": "Aktif",
                    "fieldtype": "Check",
                    "default": "1",
                },
                {
                    "fieldname": "note",
                    "label": "Not",
                    "fieldtype": "Small Text",
                },
            ],
            "permissions": [
                {
                    "role": "System Manager",
                    "read": 1,
                    "write": 1,
                    "create": 1,
                    "delete": 1,
                    "share": 1,
                    "print": 1,
                    "email": 1,
                    "report": 1,
                    "export": 1,
                }
            ],
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": doc.name}


def validate_team_setup():
    """Return minimal metadata needed for migration validation."""
    exists = bool(frappe.db.exists("DocType", "Team"))
    if not exists:
        return {"doctype_exists": False, "fields": []}

    meta = frappe.get_meta("Team")
    fieldnames = [field.fieldname for field in meta.fields]
    return {"doctype_exists": True, "fields": fieldnames}


def validate_zimmet_setup():
    """Return minimal metadata for Zimmet validation."""
    exists = bool(frappe.db.exists("DocType", "Zimmet"))
    if not exists:
        return {"doctype_exists": False, "fields": []}

    meta = frappe.get_meta("Zimmet")
    fieldnames = [field.fieldname for field in meta.fields]
    return {"doctype_exists": True, "fields": fieldnames}


def validate_field_report_setup():
    """Return minimal metadata for Field Report validation."""
    exists = bool(frappe.db.exists("DocType", "Field Report"))
    if not exists:
        return {"doctype_exists": False, "fields": []}

    meta = frappe.get_meta("Field Report")
    fieldnames = [field.fieldname for field in meta.fields]
    return {"doctype_exists": True, "fields": fieldnames}


def validate_task_progress_setup():
    """Return minimal metadata for Task Progress validation."""
    exists = bool(frappe.db.exists("DocType", "Task Progress"))
    if not exists:
        return {"doctype_exists": False, "fields": []}

    meta = frappe.get_meta("Task Progress")
    fieldnames = [field.fieldname for field in meta.fields]
    return {"doctype_exists": True, "fields": fieldnames}


def validate_technical_document_link_setup():
    """Return minimal metadata for Technical Document Link validation."""
    exists = bool(frappe.db.exists("DocType", "Technical Document Link"))
    if not exists:
        return {"doctype_exists": False, "fields": []}

    meta = frappe.get_meta("Technical Document Link")
    fieldnames = [field.fieldname for field in meta.fields]
    return {"doctype_exists": True, "fields": fieldnames}


def list_team_like_doctypes():
    rows = frappe.get_all(
        "DocType",
        filters={"name": ["like", "%Team%"]},
        pluck="name",
        order_by="name asc",
    )
    return {"rows": rows}


def create_zimmet_smoke():
    """Create a smoke Zimmet record and return identity."""
    employee = frappe.db.get_value("Employee", {}, "name")
    item = frappe.db.get_value("Item", {"disabled": 0}, "name")
    stamp = now_datetime().strftime("%Y%m%d%H%M%S")

    if not employee:
        try:
            employee_doc = frappe.get_doc(
                {
                    "doctype": "Employee",
                    "first_name": f"Smoke {stamp}",
                    "date_of_birth": "1990-01-01",
                    "date_of_joining": now_datetime().date().isoformat(),
                }
            ).insert(ignore_permissions=True, ignore_mandatory=True)
            employee = employee_doc.name
            frappe.db.commit()
        except Exception:
            return {"created": False, "reason": "missing_employee"}

    if not item:
        try:
            item_doc = frappe.get_doc(
                {
                    "doctype": "Item",
                    "item_code": f"SMOKE-ITEM-{stamp}",
                    "item_name": f"Smoke Item {stamp}",
                    "is_stock_item": 1,
                }
            ).insert(ignore_permissions=True, ignore_mandatory=True)
            item = item_doc.name
            frappe.db.commit()
        except Exception:
            return {"created": False, "reason": "missing_item"}

    doc = frappe.get_doc(
        {
            "doctype": "Zimmet",
            "employee": employee,
            "item": item,
            "quantity": 1,
            "delivery_date": now_datetime().date().isoformat(),
            "return_status": "Teslim Edildi",
            "note": f"Smoke test {stamp}",
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()

    return {"created": True, "name": doc.name, "employee": employee, "item": item}


def create_field_report_smoke():
    """Create a smoke Field Report record and return identity."""
    employee = frappe.db.get_value("Employee", {}, "name")
    stamp = now_datetime().strftime("%Y%m%d%H%M%S")

    if not employee:
        return {"created": False, "reason": "missing_employee"}

    doc = frappe.get_doc(
        {
            "doctype": "Field Report",
            "task_ref": f"SMOKE-TASK-{stamp}",
            "employee": employee,
            "report_datetime": now_datetime().isoformat(sep=" ", timespec="seconds"),
            "description": f"Smoke field report {stamp}",
            "status": "Acik",
            "has_issue": 1,
            "issue_type": "Genel",
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()

    return {"created": True, "name": doc.name, "employee": employee}


def create_task_progress_smoke():
    """Create a smoke Task Progress record and return identity."""
    employee = frappe.db.get_value("Employee", {}, "name")
    stamp = now_datetime().strftime("%Y%m%d%H%M%S")

    doc = frappe.get_doc(
        {
            "doctype": "Task Progress",
            "task_ref": f"SMOKE-TASK-{stamp}",
            "employee": employee,
            "progress_datetime": now_datetime().isoformat(sep=" ", timespec="seconds"),
            "progress_percent": 25,
            "status": "Devam Ediyor",
            "note": f"Smoke progress entry {stamp}",
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()

    return {"created": True, "name": doc.name, "employee": employee}


def create_technical_document_link_smoke():
    """Create a smoke Technical Document Link record and return identity."""
    stamp = now_datetime().strftime("%Y%m%d%H%M%S")
    doc = frappe.get_doc(
        {
            "doctype": "Technical Document Link",
            "linked_type": "Task",
            "linked_name": f"SMOKE-TASK-{stamp}",
            "document_url": "https://example.com/smoke-tech-doc",
            "revision_no": "R1",
            "is_active": 1,
            "note": f"Smoke technical doc link {stamp}",
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()

    return {"created": True, "name": doc.name, "linked_name": doc.linked_name}


def create_team_smoke():
    """Create a smoke Team record and return its identity."""
    stamp = now_datetime().strftime("%Y%m%d%H%M%S")
    team_name = f"SMOKE TEAM {stamp}"

    doc = frappe.get_doc(
        {
            "doctype": "Team",
            "team_name": team_name,
            "team_code": f"SMK-{stamp}",
            "is_active": 1,
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()

    return {"name": doc.name, "team_code": doc.team_code}


def validate_phase2_admin_back_office_setup():
    """Validate the ERPNext-side metadata needed for Phase 2 usability checks."""
    checks = []
    for doctype in [
        "Team",
        "Zimmet",
        "Field Report",
        "Task Progress",
        "Technical Document Link",
    ]:
        exists = bool(frappe.db.exists("DocType", doctype))
        fieldnames = []
        if exists:
            meta = frappe.get_meta(doctype)
            fieldnames = [field.fieldname for field in meta.fields]
        checks.append({"doctype": doctype, "exists": exists, "fields": fieldnames})

    return {"doctypes": checks}


def validate_phase2_relation_flow():
    """Validate the link-style fields used by Phase 2 admin/back-office flows."""
    expectations = [
        ("Team", "team_lead", "Link", "Employee"),
        ("Team", "default_shift_type", "Link", "Shift Type"),
        ("Zimmet", "employee", "Link", "Employee"),
        ("Zimmet", "item", "Link", "Item"),
        ("Field Report", "employee", "Link", "Employee"),
        ("Field Report", "task_ref", "Data", None),
        ("Task Progress", "employee", "Link", "Employee"),
        ("Task Progress", "task_ref", "Data", None),
        ("Technical Document Link", "linked_type", "Select", "Task\nProject\nField Report"),
    ]

    checks = []
    for doctype, fieldname, expected_type, expected_options in expectations:
        if not frappe.db.exists("DocType", doctype):
            checks.append(
                {
                    "doctype": doctype,
                    "fieldname": fieldname,
                    "exists": False,
                    "fieldtype": None,
                    "options": None,
                    "matches": False,
                }
            )
            continue

        meta = frappe.get_meta(doctype)
        field = meta.get_field(fieldname)
        checks.append(
            {
                "doctype": doctype,
                "fieldname": fieldname,
                "exists": bool(field),
                "fieldtype": getattr(field, "fieldtype", None),
                "options": getattr(field, "options", None),
                "matches": bool(field)
                and field.fieldtype == expected_type
                and (expected_options is None or field.options == expected_options),
            }
        )

    return {"checks": checks}


def create_phase2_admin_back_office_smoke_pack():
    """Create the standard smoke bundle for Phase 2 admin/back-office checks."""
    results = {
        "team": create_team_smoke(),
        "zimmet": create_zimmet_smoke(),
        "field_report": create_field_report_smoke(),
        "task_progress": create_task_progress_smoke(),
        "technical_document_link": create_technical_document_link_smoke(),
    }
    return results


def validate_system_log_entry_setup():
    """Return minimal metadata for System Log Entry validation."""
    exists = bool(frappe.db.exists("DocType", "System Log Entry"))
    if not exists:
        return {"doctype_exists": False, "fields": []}

    meta = frappe.get_meta("System Log Entry")
    fieldnames = [field.fieldname for field in meta.fields]
    return {"doctype_exists": True, "fields": fieldnames}


def validate_tenant_backup_request_setup():
    """Return minimal metadata for Tenant Backup Request validation."""
    exists = bool(frappe.db.exists("DocType", "Tenant Backup Request"))
    if not exists:
        return {"doctype_exists": False, "fields": []}

    meta = frappe.get_meta("Tenant Backup Request")
    fieldnames = [field.fieldname for field in meta.fields]
    return {"doctype_exists": True, "fields": fieldnames}


def validate_system_stabilization_setup():
    """Return a compact summary for the stabilization layer."""
    return {
        "system_log_entry": validate_system_log_entry_setup(),
        "tenant_backup_request": validate_tenant_backup_request_setup(),
    }


def validate_tenant_settings_setup():
    """Return minimal metadata for Tenant Settings validation."""
    exists = bool(frappe.db.exists("DocType", "Tenant Settings"))
    if not exists:
        return {"doctype_exists": False, "fields": []}

    meta = frappe.get_meta("Tenant Settings")
    fieldnames = [field.fieldname for field in meta.fields]
    return {"doctype_exists": True, "fields": fieldnames, "issingle": meta.issingle}


def validate_tenant_onboarding_setup():
    """Return a compact summary for tenant onboarding bootstrap assets."""
    role_names = [
        "Shipyard Worker",
        "Shipyard Foreman",
        "Shipyard Engineer",
        "Shipyard Manager",
        "Shipyard Storekeeper",
        "Shipyard HR",
    ]
    role_checks = {name: bool(frappe.db.exists("Role", name)) for name in role_names}
    default_user_email = frappe.db.get_single_value(
        "Tenant Settings",
        "default_user_email",
    ) if frappe.db.exists("DocType", "Tenant Settings") else None

    return {
        "tenant_settings": validate_tenant_settings_setup(),
        "default_roles": role_checks,
        "default_user_email": default_user_email,
    }
