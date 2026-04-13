import frappe
from frappe.utils import nowdate


def _first_existing_company():
    return frappe.db.get_value("Company", {}, "name")


def _normalize_payload(payload):
    if isinstance(payload, str):
        try:
            payload = frappe.parse_json(payload)
        except Exception:
            payload = {}

    return payload if isinstance(payload, dict) else {}


@frappe.whitelist(allow_guest=True)
def create_employee(payload=None, **kwargs):
    """Create an Employee row for the shipyard portal.

    This endpoint intentionally sits in the custom app so the frontend does not
    depend on the generic resource POST flow, which is brittle in the separate
    Vite dev setup.
    """
    data = _normalize_payload(payload)
    data.update({key: value for key, value in kwargs.items() if value not in (None, "")})

    employee_name = (data.get("employee_name") or "").strip()
    first_name = (data.get("first_name") or "").strip()

    if not employee_name:
        frappe.throw("employee_name zorunludur.")
    if not first_name:
        frappe.throw("first_name zorunludur.")

    existing_name = frappe.db.get_value("Employee", {"employee_name": employee_name}, "name")
    if existing_name:
        return {"created": False, "name": existing_name}

    company = (data.get("company") or "").strip() or _first_existing_company()

    doc = frappe.get_doc(
        {
            "doctype": "Employee",
            "employee_name": employee_name,
            "first_name": first_name,
            "last_name": (data.get("last_name") or "").strip() or None,
            "company": company or None,
            "status": (data.get("status") or "Active").strip() or "Active",
            "department": (data.get("department") or "").strip() or None,
            "designation": (data.get("designation") or "").strip() or None,
            "date_of_joining": (data.get("date_of_joining") or nowdate()).strip()
            if isinstance(data.get("date_of_joining"), str)
            else data.get("date_of_joining") or nowdate(),
            "cell_number": (data.get("cell_number") or "").strip() or None,
            "personal_email": (data.get("personal_email") or "").strip() or None,
            "reports_to": (data.get("reports_to") or "").strip() or None,
            "shipyard_team_ref": (data.get("shipyard_team_ref") or "").strip() or None,
            "shipyard_specialty": (data.get("shipyard_specialty") or "").strip() or None,
        }
    ).insert(ignore_permissions=True, ignore_mandatory=True, ignore_links=True)

    frappe.db.commit()
    return {"created": True, "name": doc.name}
