from importlib import metadata

import frappe
from frappe.utils import now_datetime


TENANT_REGISTRY_DOCTYPE = "Tenant Registry"
SUPPORT_NOTE_DOCTYPE = "Support Note"
SYSTEM_LOG_DOCTYPE = "System Log Entry"
TENANT_STATUS_OPTIONS = "Aktif\nPasif\nBakimda"
NOTE_TYPE_OPTIONS = "Bilgi\nSorun\nAksiyon\nCozum"
ISSUE_STATUS_OPTIONS = "Acik\nInceleniyor\nCozuldu\nKapandi"
HEALTH_STATUS_OPTIONS = "Bilinmiyor\nSaglikli\nSorunlu"


def _tenant_site():
    return getattr(frappe.local, "site", "") or ""


def _current_user():
    return getattr(frappe.session, "user", "") or "Guest"


def _to_bool(value, default=False):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, int):
        return value != 0

    normalized = str(value).strip().lower()
    return normalized in {"1", "true", "yes", "on"}


def _get_shipyard_version():
    try:
        return metadata.version("shipyard_app")
    except Exception:
        return "unknown"


def _create_custom_doctype(
    doctype_name,
    fields,
    title_field,
    search_fields,
    *,
    autoname="hash",
    naming_rule="Random",
):
    if frappe.db.exists("DocType", doctype_name):
        return {"created": False, "name": doctype_name}

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": doctype_name,
            "module": "Shipyard App",
            "custom": 1,
            "autoname": autoname,
            "naming_rule": naming_rule,
            "title_field": title_field,
            "search_fields": search_fields,
            "track_changes": 1,
            "fields": fields,
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


def ensure_tenant_registry_doctype():
    return _create_custom_doctype(
        TENANT_REGISTRY_DOCTYPE,
        [
            {
                "fieldname": "tenant_site",
                "label": "Tenant Site",
                "fieldtype": "Data",
                "reqd": 1,
                "unique": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "tenant_name",
                "label": "Tenant Adi",
                "fieldtype": "Data",
                "in_list_view": 1,
            },
            {
                "fieldname": "is_active",
                "label": "Aktif",
                "fieldtype": "Check",
                "default": "1",
                "in_list_view": 1,
            },
            {
                "fieldname": "tenant_status",
                "label": "Durum",
                "fieldtype": "Select",
                "options": TENANT_STATUS_OPTIONS,
                "default": "Aktif",
                "in_list_view": 1,
            },
            {
                "fieldname": "current_version",
                "label": "Versiyon",
                "fieldtype": "Data",
                "in_list_view": 1,
            },
            {
                "fieldname": "last_version_sync",
                "label": "Versiyon Senkron Tarihi",
                "fieldtype": "Datetime",
            },
            {
                "fieldname": "last_health_status",
                "label": "Son Saglik Durumu",
                "fieldtype": "Select",
                "options": HEALTH_STATUS_OPTIONS,
                "default": "Bilinmiyor",
            },
            {
                "fieldname": "last_health_checked_at",
                "label": "Son Saglik Kontrol Tarihi",
                "fieldtype": "Datetime",
            },
            {
                "fieldname": "note",
                "label": "Not",
                "fieldtype": "Small Text",
            },
        ],
        title_field="tenant_site",
        search_fields="tenant_site,tenant_name,tenant_status,current_version",
        autoname="field:tenant_site",
        naming_rule="By fieldname",
    )


def ensure_support_note_doctype():
    return _create_custom_doctype(
        SUPPORT_NOTE_DOCTYPE,
        [
            {
                "fieldname": "tenant",
                "label": "Tenant",
                "fieldtype": "Link",
                "options": TENANT_REGISTRY_DOCTYPE,
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "note_datetime",
                "label": "Not Tarihi",
                "fieldtype": "Datetime",
                "default": "Now",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "note_type",
                "label": "Not Tipi",
                "fieldtype": "Select",
                "options": NOTE_TYPE_OPTIONS,
                "default": "Bilgi",
                "in_list_view": 1,
            },
            {
                "fieldname": "issue_status",
                "label": "Sorun Durumu",
                "fieldtype": "Select",
                "options": ISSUE_STATUS_OPTIONS,
                "default": "Acik",
                "in_list_view": 1,
            },
            {
                "fieldname": "summary",
                "label": "Ozet",
                "fieldtype": "Data",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "details",
                "label": "Detaylar",
                "fieldtype": "Long Text",
            },
            {
                "fieldname": "created_by",
                "label": "Olusturan",
                "fieldtype": "Link",
                "options": "User",
                "read_only": 1,
            },
            {
                "fieldname": "related_log_name",
                "label": "Ilgili Log",
                "fieldtype": "Data",
            },
            {
                "fieldname": "reference_doctype",
                "label": "Referans DocType",
                "fieldtype": "Link",
                "options": "DocType",
            },
            {
                "fieldname": "reference_name",
                "label": "Referans Kayit",
                "fieldtype": "Data",
            },
        ],
        title_field="summary",
        search_fields="tenant,issue_status,note_type,summary",
    )


def _ensure_tenant_registry_row(
    tenant_site=None,
    tenant_name=None,
    is_active=True,
    tenant_status="Aktif",
    current_version=None,
    note=None,
):
    ensure_tenant_registry_doctype()

    site_name = (tenant_site or _tenant_site()).strip()
    if not site_name:
        frappe.throw("tenant_site zorunludur.")

    status_value = tenant_status if tenant_status in TENANT_STATUS_OPTIONS.split("\n") else "Aktif"
    if not _to_bool(is_active, default=True):
        status_value = "Pasif"

    existing_name = frappe.db.get_value(TENANT_REGISTRY_DOCTYPE, {"tenant_site": site_name}, "name")
    payload = {
        "tenant_site": site_name,
        "tenant_name": tenant_name or site_name,
        "is_active": 1 if _to_bool(is_active, default=True) else 0,
        "tenant_status": status_value,
        "current_version": current_version or _get_shipyard_version(),
        "last_version_sync": now_datetime().isoformat(sep=" ", timespec="seconds"),
        "note": note,
    }

    if existing_name:
        doc = frappe.get_doc(TENANT_REGISTRY_DOCTYPE, existing_name)
        for key, value in payload.items():
            if value is not None:
                setattr(doc, key, value)
        doc.save(ignore_permissions=True)
        frappe.db.commit()
        return {"created": False, "name": doc.name}

    doc = frappe.get_doc({"doctype": TENANT_REGISTRY_DOCTYPE, **payload}).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": doc.name}


def bootstrap_support_operations():
    tenant_registry_result = ensure_tenant_registry_doctype()
    support_note_result = ensure_support_note_doctype()
    current_tenant_result = _ensure_tenant_registry_row()
    return {
        "tenant_registry": tenant_registry_result,
        "support_note": support_note_result,
        "current_tenant_registry": current_tenant_result,
    }


@frappe.whitelist()
def register_tenant(
    tenant_site=None,
    tenant_name=None,
    is_active=1,
    tenant_status="Aktif",
    current_version=None,
    note=None,
):
    frappe.only_for("System Manager")
    result = _ensure_tenant_registry_row(
        tenant_site=tenant_site,
        tenant_name=tenant_name,
        is_active=_to_bool(is_active, default=True),
        tenant_status=tenant_status,
        current_version=current_version,
        note=note,
    )
    return {
        "ok": True,
        "tenant_site": tenant_site or _tenant_site(),
        "result": result,
    }


@frappe.whitelist()
def list_tenants(include_inactive=1):
    frappe.only_for("System Manager")
    ensure_tenant_registry_doctype()

    filters = {}
    if not _to_bool(include_inactive, default=True):
        filters["is_active"] = 1

    rows = frappe.get_all(
        TENANT_REGISTRY_DOCTYPE,
        filters=filters,
        fields=[
            "name",
            "tenant_site",
            "tenant_name",
            "is_active",
            "tenant_status",
            "current_version",
            "last_version_sync",
            "modified",
        ],
        order_by="tenant_site asc",
    )
    return {"count": len(rows), "tenants": rows}


@frappe.whitelist()
def set_tenant_status(tenant_site, is_active=1, tenant_status=None):
    frappe.only_for("System Manager")
    result = _ensure_tenant_registry_row(
        tenant_site=tenant_site,
        is_active=_to_bool(is_active, default=True),
        tenant_status=tenant_status or "Aktif",
    )
    return {
        "ok": True,
        "tenant_site": tenant_site,
        "result": result,
    }


@frappe.whitelist()
def update_tenant_version(tenant_site, current_version):
    frappe.only_for("System Manager")
    if not current_version:
        frappe.throw("current_version zorunludur.")

    result = _ensure_tenant_registry_row(
        tenant_site=tenant_site,
        current_version=current_version,
    )
    return {
        "ok": True,
        "tenant_site": tenant_site,
        "current_version": current_version,
        "result": result,
    }


@frappe.whitelist()
def add_support_note(
    tenant_site,
    summary,
    details=None,
    note_type="Bilgi",
    issue_status="Acik",
    related_log_name=None,
    reference_doctype=None,
    reference_name=None,
):
    frappe.only_for("System Manager")
    if not tenant_site:
        frappe.throw("tenant_site zorunludur.")
    if not summary:
        frappe.throw("summary zorunludur.")

    ensure_support_note_doctype()
    _ensure_tenant_registry_row(tenant_site=tenant_site)

    valid_note_type = note_type if note_type in NOTE_TYPE_OPTIONS.split("\n") else "Bilgi"
    valid_issue_status = issue_status if issue_status in ISSUE_STATUS_OPTIONS.split("\n") else "Acik"

    doc = frappe.get_doc(
        {
            "doctype": SUPPORT_NOTE_DOCTYPE,
            "tenant": tenant_site,
            "note_datetime": now_datetime().isoformat(sep=" ", timespec="seconds"),
            "note_type": valid_note_type,
            "issue_status": valid_issue_status,
            "summary": summary,
            "details": details,
            "created_by": _current_user(),
            "related_log_name": related_log_name,
            "reference_doctype": reference_doctype,
            "reference_name": reference_name,
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()

    return {
        "created": True,
        "name": doc.name,
        "tenant_site": tenant_site,
        "issue_status": doc.issue_status,
    }


@frappe.whitelist()
def list_support_notes(tenant_site=None, issue_status=None, limit=20):
    frappe.only_for("System Manager")
    ensure_support_note_doctype()

    filters = {}
    if tenant_site:
        filters["tenant"] = tenant_site
    if issue_status:
        filters["issue_status"] = issue_status

    note_limit = max(1, min(200, int(limit or 20)))
    rows = frappe.get_all(
        SUPPORT_NOTE_DOCTYPE,
        filters=filters,
        fields=[
            "name",
            "tenant",
            "note_datetime",
            "note_type",
            "issue_status",
            "summary",
            "created_by",
            "related_log_name",
            "modified",
        ],
        order_by="note_datetime desc",
        limit_page_length=note_limit,
    )
    return {"count": len(rows), "notes": rows}


@frappe.whitelist()
def get_tenant_logs(tenant_site, limit=50, severity=None, category=None):
    frappe.only_for("System Manager")
    if not tenant_site:
        frappe.throw("tenant_site zorunludur.")

    if not frappe.db.exists("DocType", SYSTEM_LOG_DOCTYPE):
        return {"count": 0, "logs": []}

    log_limit = max(1, min(500, int(limit or 50)))
    filters = {"tenant_site": tenant_site}
    if severity:
        filters["severity"] = severity
    if category:
        filters["category"] = category

    rows = frappe.get_all(
        SYSTEM_LOG_DOCTYPE,
        filters=filters,
        fields=[
            "name",
            "tenant_site",
            "logged_at",
            "severity",
            "category",
            "message",
            "endpoint",
            "http_method",
            "status_code",
            "reference_doctype",
            "reference_name",
        ],
        order_by="logged_at desc",
        limit_page_length=log_limit,
    )
    return {"count": len(rows), "logs": rows}
