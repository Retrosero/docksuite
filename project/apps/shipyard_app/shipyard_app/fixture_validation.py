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
