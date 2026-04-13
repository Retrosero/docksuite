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


def _to_search_filters(search):
    term = (search or "").strip()
    if not term:
        return None

    return [
        ["Employee", "name", "like", f"%{term}%"],
        ["Employee", "employee_name", "like", f"%{term}%"],
        ["Employee", "department", "like", f"%{term}%"],
        ["Employee", "designation", "like", f"%{term}%"],
    ]


def _employee_fields():
    return [
        "name",
        "employee_name",
        "status",
        "designation",
        "department",
        "company",
        "date_of_joining",
        "cell_number",
        "personal_email",
        "reports_to",
        "shipyard_team_ref",
        "shipyard_specialty",
    ]


def _existing_employee_fields():
    fields = _employee_fields()
    return [field for field in fields if frappe.db.has_column("Employee", field)]


def _existing_employee_write_fields():
    return [
        field
        for field in [
            "employee_name",
            "first_name",
            "last_name",
            "company",
            "status",
            "department",
            "designation",
            "date_of_joining",
            "cell_number",
            "personal_email",
            "reports_to",
            "shipyard_team_ref",
            "shipyard_specialty",
        ]
        if frappe.db.has_column("Employee", field)
    ]


@frappe.whitelist(allow_guest=True)
def list_employees(search=None, page=1, page_size=12):
    safe_page = max(int(page or 1), 1)
    safe_page_size = max(int(page_size or 12), 1)
    start = (safe_page - 1) * safe_page_size
    or_filters = _to_search_filters(search)
    fields = _existing_employee_fields()

    all_matches = frappe.get_all(
        "Employee",
        fields=["name"],
        or_filters=or_filters,
    )
    rows = frappe.get_all(
        "Employee",
        fields=fields,
        or_filters=or_filters,
        order_by="modified desc",
        limit_start=start,
        limit_page_length=safe_page_size,
    )
    return {
        "items": rows,
        "total": len(all_matches),
        "page": safe_page,
        "pageSize": safe_page_size,
    }


@frappe.whitelist(allow_guest=True)
def get_employee(employee_id):
    if not employee_id:
        return {"employee": None}

    row = frappe.get_value("Employee", employee_id, _existing_employee_fields(), as_dict=True)
    return {"employee": row}


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
    write_fields = set(_existing_employee_write_fields())

    doc_data = {"doctype": "Employee"}

    for field, value in {
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
    }.items():
        if field in write_fields and value not in (None, ""):
            doc_data[field] = value

    doc = frappe.get_doc(doc_data).insert(ignore_permissions=True, ignore_mandatory=True, ignore_links=True)

    frappe.db.commit()
    return {"created": True, "name": doc.name}
