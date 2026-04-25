import frappe
from frappe.utils import nowdate
from shipyard_app import tenant_onboarding

EMPLOYEE_REQUIRED_FIELDS = (
    ("first_name", "Ad"),
    ("company", "Şirket"),
    ("gender", "Cinsiyet"),
    ("date_of_birth", "Doğum tarihi"),
    ("date_of_joining", "İşe giriş tarihi"),
)


def _first_existing_company():
    return frappe.db.get_value("Company", {}, "name")


def _normalize_payload(payload):
    if isinstance(payload, str):
        try:
            payload = frappe.parse_json(payload)
        except Exception:
            payload = {}

    return payload if isinstance(payload, dict) else {}


def _normalize_text(value):
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def _validate_required_employee_fields(data):
    missing_labels = [
        label
        for field, label in EMPLOYEE_REQUIRED_FIELDS
        if not _normalize_text(data.get(field))
    ]

    if missing_labels:
        frappe.throw("Zorunlu alanlar eksik: " + ", ".join(missing_labels))


def _compose_employee_name(data):
    employee_name = _normalize_text(data.get("employee_name"))
    if employee_name:
        return employee_name

    first_name = _normalize_text(data.get("first_name"))
    last_name = _normalize_text(data.get("last_name"))
    return " ".join(part for part in [first_name, last_name] if part).strip()


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
        "first_name",
        "last_name",
        "status",
        "gender",
        "designation",
        "department",
        "branch",
        "company",
        "date_of_joining",
        "date_of_birth",
        "cell_number",
        "emergency_phone_number",
        "company_email",
        "personal_email",
        "current_address",
        "permanent_address",
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
            "gender",
            "department",
            "designation",
            "branch",
            "date_of_joining",
            "date_of_birth",
            "cell_number",
            "emergency_phone_number",
            "company_email",
            "personal_email",
            "current_address",
            "permanent_address",
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

    _validate_required_employee_fields(data)

    employee_name = _compose_employee_name(data)
    if not employee_name:
        frappe.throw("employee_name zorunludur.")

    existing_name = frappe.db.get_value("Employee", {"employee_name": employee_name}, "name")
    if existing_name:
        return {"created": False, "name": existing_name}

    company = _normalize_text(data.get("company")) or _first_existing_company()
    write_fields = set(_existing_employee_write_fields())

    doc_data = {"doctype": "Employee"}

    for field, value in {
        "employee_name": employee_name,
        "first_name": _normalize_text(data.get("first_name")),
        "last_name": _normalize_text(data.get("last_name")) or None,
        "company": company or None,
        "status": _normalize_text(data.get("status")) or "Active",
        "gender": _normalize_text(data.get("gender")) or None,
        "department": _normalize_text(data.get("department")) or None,
        "designation": _normalize_text(data.get("designation")) or None,
        "branch": _normalize_text(data.get("branch")) or None,
        "date_of_joining": _normalize_text(data.get("date_of_joining")) or nowdate(),
        "date_of_birth": _normalize_text(data.get("date_of_birth")) or None,
        "cell_number": _normalize_text(data.get("cell_number")) or None,
        "emergency_phone_number": _normalize_text(data.get("emergency_phone_number")) or None,
        "company_email": _normalize_text(data.get("company_email")) or None,
        "personal_email": _normalize_text(data.get("personal_email")) or None,
        "current_address": _normalize_text(data.get("current_address")) or None,
        "permanent_address": _normalize_text(data.get("permanent_address")) or None,
        "reports_to": _normalize_text(data.get("reports_to")) or None,
        "shipyard_team_ref": _normalize_text(data.get("shipyard_team_ref")) or None,
        "shipyard_specialty": _normalize_text(data.get("shipyard_specialty")) or None,
    }.items():
        if field in write_fields and value not in (None, ""):
            doc_data[field] = value

    doc = frappe.get_doc(doc_data).insert(ignore_permissions=True)

    frappe.db.commit()
    return {"created": True, "name": doc.name}


@frappe.whitelist(allow_guest=True)
def update_employee(employee_id=None, payload=None, **kwargs):
    data = _normalize_payload(payload)
    data.update({key: value for key, value in kwargs.items() if value is not None})

    employee_id = (employee_id or data.get("employee_id") or "").strip()
    if not employee_id:
        frappe.throw("employee_id zorunludur.")

    doc = frappe.get_doc("Employee", employee_id)
    write_fields = set(_existing_employee_write_fields())

    updates = {
        "employee_name": _normalize_text(data.get("employee_name")) or None,
        "first_name": _normalize_text(data.get("first_name")) or None,
        "last_name": _normalize_text(data.get("last_name")) or None,
        "company": _normalize_text(data.get("company")) or None,
        "status": _normalize_text(data.get("status")) or None,
        "gender": _normalize_text(data.get("gender")) or None,
        "department": _normalize_text(data.get("department")) or None,
        "designation": _normalize_text(data.get("designation")) or None,
        "branch": _normalize_text(data.get("branch")) or None,
        "date_of_joining": _normalize_text(data.get("date_of_joining")) or None,
        "date_of_birth": _normalize_text(data.get("date_of_birth")) or None,
        "cell_number": _normalize_text(data.get("cell_number")) or None,
        "emergency_phone_number": _normalize_text(data.get("emergency_phone_number")) or None,
        "company_email": _normalize_text(data.get("company_email")) or None,
        "personal_email": _normalize_text(data.get("personal_email")) or None,
        "current_address": data.get("current_address") or None,
        "permanent_address": data.get("permanent_address") or None,
        "reports_to": _normalize_text(data.get("reports_to")) or None,
        "shipyard_team_ref": _normalize_text(data.get("shipyard_team_ref")) or None,
        "shipyard_specialty": _normalize_text(data.get("shipyard_specialty")) or None,
    }

    merged_data = {
        key: getattr(doc, key, None)
        for key, _ in EMPLOYEE_REQUIRED_FIELDS
    }
    merged_data.update({key: value for key, value in updates.items() if key in merged_data})
    _validate_required_employee_fields(merged_data)

    for field, value in updates.items():
        if field in write_fields:
            setattr(doc, field, value)

    doc.save(ignore_permissions=True)
    frappe.db.commit()
    return {"updated": True, "name": doc.name}


@frappe.whitelist(allow_guest=True)
def delete_employee(employee_id=None):
    employee_id = (employee_id or "").strip()
    if not employee_id:
        frappe.throw("employee_id zorunludur.")

    if not frappe.db.exists("Employee", employee_id):
        return {"deleted": False, "name": employee_id}

    frappe.delete_doc("Employee", employee_id, ignore_permissions=True, force=1)
    frappe.db.commit()
    return {"deleted": True, "name": employee_id}


@frappe.whitelist(allow_guest=True)
def list_employee_document_records(employee_id):
    employee_id = _normalize_text(employee_id)
    if not employee_id:
        return {"items": []}

    tenant_onboarding.ensure_employee_document_record_doctype()

    items = frappe.get_all(
        "Employee Document Record",
        fields=[
            "name",
            "employee",
            "employee_name",
            "document_type",
            "file_ref",
            "issue_date",
            "expiry_date",
            "status",
            "is_required",
            "note",
            "modified",
        ],
        filters={"employee": employee_id},
        order_by="modified desc",
        limit_page_length=100,
    )

    file_names = [row.get("file_ref") for row in items if row.get("file_ref")]
    file_map = {}
    if file_names:
        file_rows = frappe.get_all(
            "File",
            fields=["name", "file_name", "file_url", "is_private"],
            filters={"name": ["in", file_names]},
            limit_page_length=200,
        )
        file_map = {row.get("name"): row for row in file_rows}

    for row in items:
        file_ref = row.get("file_ref")
        linked_file = file_map.get(file_ref) if file_ref else None
        if linked_file:
            row["file_name"] = linked_file.get("file_name")
            row["file_url"] = linked_file.get("file_url")
            row["is_private"] = linked_file.get("is_private")
        else:
            row["file_name"] = None
            row["file_url"] = None
            row["is_private"] = None

    return {"items": items}


def _to_check_value(value, default=1):
    text = _normalize_text(value).lower()
    if text in {"0", "false", "no", "off"}:
        return 0
    if text in {"1", "true", "yes", "on"}:
        return 1
    return int(default)


@frappe.whitelist(allow_guest=True)
def upsert_employee_document_record(record_id=None, payload=None, **kwargs):
    data = _normalize_payload(payload)
    data.update({key: value for key, value in kwargs.items() if value is not None})

    tenant_onboarding.ensure_employee_document_record_doctype()

    employee_id = _normalize_text(data.get("employee") or data.get("employee_id"))
    document_type = _normalize_text(data.get("document_type"))
    file_ref = _normalize_text(data.get("file_ref")) or None
    issue_date = _normalize_text(data.get("issue_date")) or None
    expiry_date = _normalize_text(data.get("expiry_date")) or None
    status = _normalize_text(data.get("status")) or "Pending Review"
    note = _normalize_text(data.get("note")) or None
    is_required = _to_check_value(data.get("is_required"), default=1)

    if not employee_id:
        frappe.throw("employee zorunludur.")
    if not document_type:
        frappe.throw("document_type zorunludur.")

    record_id = _normalize_text(record_id or data.get("record_id"))
    is_update = bool(record_id)

    if is_update:
        if not frappe.db.exists("Employee Document Record", record_id):
            frappe.throw("Belge kaydi bulunamadi.")
        doc = frappe.get_doc("Employee Document Record", record_id)
    else:
        doc = frappe.get_doc({"doctype": "Employee Document Record"})

    doc.employee = employee_id
    doc.document_type = document_type
    doc.file_ref = file_ref
    doc.issue_date = issue_date
    doc.expiry_date = expiry_date
    doc.status = status
    doc.is_required = is_required
    doc.note = note

    if is_update:
        doc.save(ignore_permissions=True)
    else:
        doc.insert(ignore_permissions=True)

    frappe.db.commit()
    return {
        "created": not is_update,
        "updated": is_update,
        "name": doc.name,
    }


@frappe.whitelist(allow_guest=True)
def delete_employee_document_record(record_id):
    record_id = _normalize_text(record_id)
    if not record_id:
        frappe.throw("record_id zorunludur.")

    if not frappe.db.exists("Employee Document Record", record_id):
        return {"deleted": False, "name": record_id}

    frappe.delete_doc("Employee Document Record", record_id, ignore_permissions=True, force=1)
    frappe.db.commit()
    return {"deleted": True, "name": record_id}
