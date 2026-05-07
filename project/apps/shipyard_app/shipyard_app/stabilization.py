import json

import frappe
from frappe.utils import now_datetime


SYSTEM_LOG_DOCTYPE = "System Log Entry"
TENANT_BACKUP_REQUEST_DOCTYPE = "Tenant Backup Request"
BANK_RECONCILIATION_MATCH_DOCTYPE = "Bank Reconciliation Match"
SYSTEM_LOG_LEVELS = "Info\nWarning\nError"
BACKUP_SCOPE_OPTIONS = "Full Site\nDatabase Only\nFiles Only"
BACKUP_STATUS_OPTIONS = "Queued\nIn Progress\nCompleted\nFailed"


def _tenant_site():
    return getattr(frappe.local, "site", "") or ""


def _current_user():
    return getattr(frappe.session, "user", "") or "Guest"


def _rate_limit_key(bucket):
    site = _tenant_site() or "unknown-site"
    user = _current_user() or "Guest"
    return f"shipyard:rate_limit:{bucket}:{site}:{user}"


def _enforce_rate_limit(bucket, limit=20, window_seconds=60):
    cache = frappe.cache()
    key = _rate_limit_key(bucket)
    current = cache.get_value(key)
    count = int(current or 0)
    if count >= int(limit):
        frappe.throw("Rate limit asildi. Lutfen kisa bir sure sonra tekrar deneyin.", frappe.ValidationError)
    if count <= 0:
        cache.set_value(key, 1, expires_in_sec=int(window_seconds))
    else:
        cache.set_value(key, count + 1, expires_in_sec=int(window_seconds))


def _create_custom_doctype(
    doctype_name,
    fields,
    title_field,
    search_fields,
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


def ensure_system_log_doctype():
    """Create the tenant-safe log store when it is missing."""
    return _create_custom_doctype(
        SYSTEM_LOG_DOCTYPE,
        [
            {
                "fieldname": "tenant_site",
                "label": "Tenant Site",
                "fieldtype": "Data",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "logged_at",
                "label": "Logged At",
                "fieldtype": "Datetime",
                "default": "Now",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "severity",
                "label": "Severity",
                "fieldtype": "Select",
                "options": SYSTEM_LOG_LEVELS,
                "default": "Info",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "category",
                "label": "Category",
                "fieldtype": "Data",
                "default": "system",
                "in_list_view": 1,
            },
            {
                "fieldname": "message",
                "label": "Message",
                "fieldtype": "Small Text",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "endpoint",
                "label": "Endpoint",
                "fieldtype": "Data",
            },
            {
                "fieldname": "http_method",
                "label": "HTTP Method",
                "fieldtype": "Data",
            },
            {
                "fieldname": "user",
                "label": "User",
                "fieldtype": "Link",
                "options": "User",
            },
            {
                "fieldname": "reference_doctype",
                "label": "Reference DocType",
                "fieldtype": "Link",
                "options": "DocType",
            },
            {
                "fieldname": "reference_name",
                "label": "Reference Name",
                "fieldtype": "Data",
            },
            {
                "fieldname": "status_code",
                "label": "Status Code",
                "fieldtype": "Int",
            },
            {
                "fieldname": "details",
                "label": "Details",
                "fieldtype": "Long Text",
            },
            {
                "fieldname": "traceback",
                "label": "Traceback",
                "fieldtype": "Long Text",
            },
        ],
        title_field="message",
        search_fields="tenant_site,severity,category,message,endpoint,user",
    )


def ensure_tenant_backup_request_doctype():
    """Create the backup request tracker used by the manual backup flow."""
    return _create_custom_doctype(
        TENANT_BACKUP_REQUEST_DOCTYPE,
        [
            {
                "fieldname": "tenant_site",
                "label": "Tenant Site",
                "fieldtype": "Data",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "requested_at",
                "label": "Requested At",
                "fieldtype": "Datetime",
                "default": "Now",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "request_mode",
                "label": "Request Mode",
                "fieldtype": "Select",
                "options": "Manual\nScheduled",
                "default": "Manual",
                "reqd": 1,
            },
            {
                "fieldname": "backup_scope",
                "label": "Backup Scope",
                "fieldtype": "Select",
                "options": BACKUP_SCOPE_OPTIONS,
                "default": "Full Site",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "requested_by",
                "label": "Requested By",
                "fieldtype": "Link",
                "options": "User",
                "in_list_view": 1,
            },
            {
                "fieldname": "status",
                "label": "Status",
                "fieldtype": "Select",
                "options": BACKUP_STATUS_OPTIONS,
                "default": "Queued",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "backup_path",
                "label": "Backup Path",
                "fieldtype": "Data",
            },
            {
                "fieldname": "result_message",
                "label": "Result Message",
                "fieldtype": "Long Text",
            },
            {
                "fieldname": "note",
                "label": "Note",
                "fieldtype": "Small Text",
            },
        ],
        title_field="backup_scope",
        search_fields="tenant_site,status,backup_scope,requested_by",
    )


def ensure_bank_reconciliation_match_doctype():
    """Create confirmed bank reconciliation match store."""
    return _create_custom_doctype(
        BANK_RECONCILIATION_MATCH_DOCTYPE,
        [
            {"fieldname": "tenant_site", "label": "Tenant Site", "fieldtype": "Data", "reqd": 1, "in_list_view": 1},
            {"fieldname": "confirmed_at", "label": "Confirmed At", "fieldtype": "Datetime", "default": "Now", "reqd": 1, "in_list_view": 1},
            {"fieldname": "confirmed_by", "label": "Confirmed By", "fieldtype": "Link", "options": "User", "in_list_view": 1},
            {"fieldname": "statement_date", "label": "Statement Date", "fieldtype": "Date", "in_list_view": 1},
            {"fieldname": "statement_description", "label": "Statement Description", "fieldtype": "Small Text"},
            {"fieldname": "statement_amount", "label": "Statement Amount", "fieldtype": "Currency", "in_list_view": 1},
            {"fieldname": "payment_entry_name", "label": "Payment Entry", "fieldtype": "Link", "options": "Payment Entry", "reqd": 1, "in_list_view": 1},
            {"fieldname": "confidence", "label": "Confidence", "fieldtype": "Select", "options": "high\nmedium\nlow", "in_list_view": 1},
            {"fieldname": "reason", "label": "Reason", "fieldtype": "Small Text"},
        ],
        title_field="payment_entry_name",
        search_fields="tenant_site,payment_entry_name,confirmed_by,statement_description",
    )


def bootstrap_system_stabilization():
    """Ensure the stabilization layer doctypes exist for this tenant site."""
    return {
        "system_log_entry": ensure_system_log_doctype(),
        "tenant_backup_request": ensure_tenant_backup_request_doctype(),
        "bank_reconciliation_match": ensure_bank_reconciliation_match_doctype(),
    }


def write_system_log(
    severity,
    message,
    category="system",
    endpoint=None,
    http_method=None,
    status_code=None,
    details=None,
    traceback=None,
    reference_doctype=None,
    reference_name=None,
    user=None,
):
    """Store a single log row in a tenant-scoped custom DocType."""
    ensure_system_log_doctype()
    payload = {
        "doctype": SYSTEM_LOG_DOCTYPE,
        "tenant_site": _tenant_site(),
        "logged_at": now_datetime().isoformat(sep=" ", timespec="seconds"),
        "severity": severity,
        "category": category,
        "message": message,
        "endpoint": endpoint,
        "http_method": http_method,
        "user": user or _current_user(),
        "reference_doctype": reference_doctype,
        "reference_name": reference_name,
        "status_code": status_code,
        "details": details,
        "traceback": traceback,
    }
    doc = frappe.get_doc(payload).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": doc.name}


@frappe.whitelist()
def log_info(message, category="system", endpoint=None, http_method=None, details=None):
    return write_system_log(
        "Info",
        message,
        category=category,
        endpoint=endpoint,
        http_method=http_method,
        details=details,
    )


@frappe.whitelist()
def log_warning(message, category="system", endpoint=None, http_method=None, details=None):
    return write_system_log(
        "Warning",
        message,
        category=category,
        endpoint=endpoint,
        http_method=http_method,
        details=details,
    )


@frappe.whitelist()
def log_error(
    message,
    category="system",
    endpoint=None,
    http_method=None,
    status_code=None,
    details=None,
    traceback=None,
    reference_doctype=None,
    reference_name=None,
):
    return write_system_log(
        "Error",
        message,
        category=category,
        endpoint=endpoint,
        http_method=http_method,
        status_code=status_code,
        details=details,
        traceback=traceback,
        reference_doctype=reference_doctype,
        reference_name=reference_name,
    )


@frappe.whitelist(allow_guest=True)
def health_check():
    """Return a minimal availability snapshot for monitoring."""
    checked_at = now_datetime().isoformat(sep=" ", timespec="seconds")

    db_result = {"ok": True, "message": "db ok"}
    try:
        frappe.db.sql("select 1")
    except Exception as exc:
        db_result = {"ok": False, "message": str(exc)}

    redis_result = {"ok": True, "message": "redis ok"}
    try:
        cache = frappe.cache()
        ping = getattr(cache, "ping", None)
        if callable(ping):
            ping()
        else:
            cache.get_value("_shipyard_health_check")
    except Exception as exc:
        redis_result = {"ok": False, "message": str(exc)}

    payload = {
        "ok": db_result["ok"] and redis_result["ok"],
        "tenant_site": _tenant_site(),
        "checked_at": checked_at,
        "db": db_result,
        "redis": redis_result,
    }

    if not payload["ok"]:
        try:
            write_system_log(
                "Error",
                "Health check failed",
                category="health",
                endpoint="/api/method/shipyard_app.stabilization.health_check",
                http_method="GET",
                details=json.dumps(payload, ensure_ascii=True),
            )
        except Exception:
            pass

    return payload


@frappe.whitelist()
def request_manual_backup(backup_scope="Full Site", note=None):
    """Create a backup request entry; actual backup execution stays operational."""
    _enforce_rate_limit("request_manual_backup", limit=5, window_seconds=300)

    if backup_scope not in {"Full Site", "Database Only", "Files Only"}:
        backup_scope = "Full Site"

    ensure_tenant_backup_request_doctype()
    doc = frappe.get_doc(
        {
            "doctype": TENANT_BACKUP_REQUEST_DOCTYPE,
            "tenant_site": _tenant_site(),
            "requested_at": now_datetime().isoformat(sep=" ", timespec="seconds"),
            "request_mode": "Manual",
            "backup_scope": backup_scope,
            "requested_by": _current_user(),
            "status": "Queued",
            "note": note,
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()

    try:
        write_system_log(
            "Info",
            "Manual backup requested",
            category="backup",
            endpoint="/api/method/shipyard_app.stabilization.request_manual_backup",
            http_method="POST",
            reference_doctype=TENANT_BACKUP_REQUEST_DOCTYPE,
            reference_name=doc.name,
            details=json.dumps(
                {
                    "backup_scope": backup_scope,
                    "request_name": doc.name,
                },
                ensure_ascii=True,
            ),
        )
    except Exception:
        pass

    return {
        "created": True,
        "name": doc.name,
        "status": doc.status,
        "backup_scope": doc.backup_scope,
        "tenant_site": doc.tenant_site,
    }


@frappe.whitelist()
def tenant_boundary_smoke():
    """Quick tenant-boundary smoke payload for staging checks."""
    _enforce_rate_limit("tenant_boundary_smoke", limit=30, window_seconds=60)
    return {
        "ok": True,
        "tenant_site": _tenant_site(),
        "session_user": _current_user(),
        "checked_at": now_datetime().isoformat(sep=" ", timespec="seconds"),
    }


@frappe.whitelist()
def confirm_bank_reconciliation_match(
    statement_date=None,
    statement_description=None,
    statement_amount=None,
    payment_entry_name=None,
    confidence=None,
    reason=None,
):
    """Persist a confirmed reconciliation suggestion as tenant-scoped audit log."""
    _enforce_rate_limit("confirm_bank_reconciliation_match", limit=120, window_seconds=60)

    if not payment_entry_name:
        frappe.throw("Payment Entry zorunludur.", frappe.ValidationError)

    ensure_bank_reconciliation_match_doctype()
    doc = frappe.get_doc(
        {
            "doctype": BANK_RECONCILIATION_MATCH_DOCTYPE,
            "tenant_site": _tenant_site(),
            "confirmed_at": now_datetime().isoformat(sep=" ", timespec="seconds"),
            "confirmed_by": _current_user(),
            "statement_date": statement_date,
            "statement_description": statement_description,
            "statement_amount": statement_amount,
            "payment_entry_name": payment_entry_name,
            "confidence": confidence,
            "reason": reason,
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"status": "ok", "match_name": doc.name}


@frappe.whitelist()
def get_recent_bank_reconciliation_events(limit=20):
    """Return recent confirmed reconciliation events for current tenant site."""
    _enforce_rate_limit("get_recent_bank_reconciliation_events", limit=60, window_seconds=60)
    ensure_bank_reconciliation_match_doctype()

    safe_limit = max(1, min(int(limit or 20), 100))
    rows = frappe.get_all(
        BANK_RECONCILIATION_MATCH_DOCTYPE,
        filters={"tenant_site": _tenant_site()},
        fields=[
            "name",
            "confirmed_at",
            "confirmed_by",
            "statement_date",
            "statement_description",
            "statement_amount",
            "payment_entry_name",
            "confidence",
            "reason",
        ],
        order_by="confirmed_at desc",
        limit_page_length=safe_limit,
    )
    return {"items": rows, "count": len(rows)}
