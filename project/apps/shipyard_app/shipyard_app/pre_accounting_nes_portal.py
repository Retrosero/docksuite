import json
from urllib.parse import urljoin

import frappe
from frappe import _
from frappe.utils import now_datetime


CONFIG_DEFAULT_KEY = "pre_accounting_nes_portal_config"
SALES_INVOICE_DOCTYPE = "Sales Invoice"
INTEGRATION_ROLES = {"Accounts Manager", "System Manager"}
ACCOUNT_ROLES = {"Accounts User", "Accounts Manager", "System Manager"}
DEFAULT_CONFIG = {
    "enabled": 0,
    "base_url": "https://api.nes.com.tr",
    "send_path": "/fatura/olustur",
    "status_path": "/fatura/durum/{uuid}",
    "username": "",
    "access_token": "",
    "sandbox": 1,
}
NES_STATUSES = {
    "Not Sent",
    "Queued",
    "Sent",
    "Accepted",
    "Rejected",
    "Cancelled",
    "Error",
}


def _require_authenticated_user():
    if frappe.session.user == "Guest":
        frappe.throw(_("Bu islem icin oturum acmalisiniz."), frappe.PermissionError)


def _require_account_access():
    _require_authenticated_user()
    user_roles = set(frappe.get_roles(frappe.session.user) or [])
    if not user_roles.intersection(ACCOUNT_ROLES):
        frappe.throw(_("Bu islem icin muhasebe erisimi gerekli."), frappe.PermissionError)


def _require_integration_manager():
    _require_authenticated_user()
    user_roles = set(frappe.get_roles(frappe.session.user) or [])
    if not user_roles.intersection(INTEGRATION_ROLES):
        frappe.throw(_("NES Portal ayarlari icin yonetici yetkisi gerekli."), frappe.PermissionError)


def _read_config(include_secret=False):
    raw = frappe.defaults.get_global_default(CONFIG_DEFAULT_KEY) or "{}"
    try:
        saved = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        saved = {}

    config = {**DEFAULT_CONFIG, **{key: value for key, value in saved.items() if key in DEFAULT_CONFIG}}
    config["enabled"] = 1 if str(config.get("enabled")) in {"1", "true", "True"} else 0
    config["sandbox"] = 1 if str(config.get("sandbox")) in {"1", "true", "True"} else 0

    if not include_secret:
        config["access_token"] = "********" if config.get("access_token") else ""
    return config


def _write_config(payload):
    current = _read_config(include_secret=True)
    next_config = {**current}
    for key in DEFAULT_CONFIG:
        if key not in payload:
            continue
        value = payload.get(key)
        if key == "access_token" and value == "********":
            continue
        next_config[key] = value

    next_config["enabled"] = 1 if str(next_config.get("enabled")) in {"1", "true", "True"} else 0
    next_config["sandbox"] = 1 if str(next_config.get("sandbox")) in {"1", "true", "True"} else 0
    frappe.defaults.set_global_default(CONFIG_DEFAULT_KEY, json.dumps(next_config, ensure_ascii=True))
    frappe.db.commit()
    return _read_config(include_secret=False)


def _ensure_custom_field(dt, fieldname, fieldtype, label, **kwargs):
    if not frappe.db.exists("DocType", dt):
        return {"created": False, "reason": "doctype_missing", "name": f"{dt}-{fieldname}"}

    meta = frappe.get_meta(dt)
    if meta.get_field(fieldname):
        return {"created": False, "exists": True, "name": f"{dt}-{fieldname}"}

    custom_field_name = f"{dt}-{fieldname}"
    if frappe.db.exists("Custom Field", custom_field_name):
        return {"created": False, "exists": True, "name": custom_field_name}

    doc = frappe.get_doc(
        {
            "doctype": "Custom Field",
            "dt": dt,
            "fieldname": fieldname,
            "fieldtype": fieldtype,
            "label": label,
            **kwargs,
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": doc.name}


def ensure_nes_portal_sales_invoice_fields():
    return {
        "nes_portal_section": _ensure_custom_field(
            SALES_INVOICE_DOCTYPE,
            "nes_portal_section",
            "Section Break",
            "NES Portal",
            insert_after="remarks",
            collapsible=1,
        ),
        "nes_portal_status": _ensure_custom_field(
            SALES_INVOICE_DOCTYPE,
            "nes_portal_status",
            "Select",
            "NES Portal Durumu",
            options="\n".join(sorted(NES_STATUSES)),
            default="Not Sent",
            insert_after="nes_portal_section",
            read_only=1,
            in_list_view=1,
        ),
        "nes_portal_uuid": _ensure_custom_field(
            SALES_INVOICE_DOCTYPE,
            "nes_portal_uuid",
            "Data",
            "NES Belge UUID",
            insert_after="nes_portal_status",
            read_only=1,
            in_list_view=1,
        ),
        "nes_portal_last_sync_at": _ensure_custom_field(
            SALES_INVOICE_DOCTYPE,
            "nes_portal_last_sync_at",
            "Datetime",
            "NES Son Senkron",
            insert_after="nes_portal_uuid",
            read_only=1,
        ),
        "nes_portal_error": _ensure_custom_field(
            SALES_INVOICE_DOCTYPE,
            "nes_portal_error",
            "Small Text",
            "NES Hata Mesaji",
            insert_after="nes_portal_last_sync_at",
            read_only=1,
        ),
        "nes_portal_response": _ensure_custom_field(
            SALES_INVOICE_DOCTYPE,
            "nes_portal_response",
            "Code",
            "NES Son Yanit",
            options="JSON",
            insert_after="nes_portal_error",
            read_only=1,
        ),
    }


def _normalise_status(value):
    if not value:
        return "Sent"
    text = str(value).strip()
    lookup = {
        "accepted": "Accepted",
        "approved": "Accepted",
        "success": "Accepted",
        "sent": "Sent",
        "queued": "Queued",
        "pending": "Queued",
        "rejected": "Rejected",
        "cancelled": "Cancelled",
        "canceled": "Cancelled",
        "error": "Error",
        "failed": "Error",
    }
    return lookup.get(text.lower(), text if text in NES_STATUSES else "Sent")


def _compose_url(base_url, path):
    base = str(base_url or "").strip().rstrip("/") + "/"
    clean_path = str(path or "").strip().lstrip("/")
    return urljoin(base, clean_path)


def _get_invoice_payload(invoice_doc):
    return {
        "source": "ERPNext",
        "document_type": "Sales Invoice",
        "document_name": invoice_doc.name,
        "posting_date": str(invoice_doc.posting_date),
        "due_date": str(invoice_doc.get("due_date") or ""),
        "currency": invoice_doc.get("currency"),
        "customer": {
            "name": invoice_doc.get("customer"),
            "title": invoice_doc.get("customer_name") or invoice_doc.get("customer"),
            "tax_id": invoice_doc.get("tax_id") or invoice_doc.get("tax_no") or "",
        },
        "totals": {
            "net_total": float(invoice_doc.get("net_total") or 0),
            "tax_total": float(invoice_doc.get("total_taxes_and_charges") or 0),
            "grand_total": float(invoice_doc.get("grand_total") or 0),
        },
        "items": [
            {
                "item_code": row.get("item_code"),
                "item_name": row.get("item_name"),
                "description": row.get("description"),
                "qty": float(row.get("qty") or 0),
                "uom": row.get("uom"),
                "rate": float(row.get("rate") or 0),
                "amount": float(row.get("amount") or 0),
            }
            for row in invoice_doc.get("items", [])
        ],
    }


def _extract_uuid(response):
    if not isinstance(response, dict):
        return ""
    for key in ("uuid", "ettn", "document_uuid", "invoice_uuid", "id"):
        if response.get(key):
            return str(response.get(key))
    data = response.get("data")
    if isinstance(data, dict):
        return _extract_uuid(data)
    return ""


def _extract_status(response):
    if not isinstance(response, dict):
        return "Sent"
    for key in ("status", "document_status", "invoice_status", "state"):
        if response.get(key):
            return _normalise_status(response.get(key))
    data = response.get("data")
    if isinstance(data, dict):
        return _extract_status(data)
    return "Sent"


def _set_invoice_status(invoice_name, status, response=None, error_message=""):
    ensure_nes_portal_sales_invoice_fields()
    values = {
        "nes_portal_status": _normalise_status(status),
        "nes_portal_last_sync_at": now_datetime(),
        "nes_portal_error": error_message or "",
    }
    if response is not None:
        values["nes_portal_response"] = json.dumps(response, ensure_ascii=True, default=str)
        uuid = _extract_uuid(response)
        if uuid:
            values["nes_portal_uuid"] = uuid

    frappe.db.set_value(SALES_INVOICE_DOCTYPE, invoice_name, values, update_modified=False)
    frappe.db.commit()
    return frappe.db.get_value(
        SALES_INVOICE_DOCTYPE,
        invoice_name,
        ["name", "nes_portal_status", "nes_portal_uuid", "nes_portal_last_sync_at", "nes_portal_error"],
        as_dict=True,
    )


@frappe.whitelist()
def setup_nes_portal_fields():
    _require_integration_manager()
    return ensure_nes_portal_sales_invoice_fields()


@frappe.whitelist()
def get_nes_portal_config():
    _require_account_access()
    ensure_nes_portal_sales_invoice_fields()
    return _read_config(include_secret=False)


@frappe.whitelist()
def save_nes_portal_config(**payload):
    _require_integration_manager()
    ensure_nes_portal_sales_invoice_fields()
    return _write_config(payload)


@frappe.whitelist()
def get_e_document_queue(limit=50):
    _require_account_access()
    ensure_nes_portal_sales_invoice_fields()
    limit = max(1, min(int(limit or 50), 200))
    rows = frappe.get_all(
        SALES_INVOICE_DOCTYPE,
        filters={"docstatus": 1},
        fields=[
            "name",
            "customer",
            "customer_name",
            "posting_date",
            "grand_total",
            "currency",
            "nes_portal_status",
            "nes_portal_uuid",
            "nes_portal_last_sync_at",
            "nes_portal_error",
        ],
        order_by="posting_date desc, modified desc",
        limit_page_length=limit,
    )
    for row in rows:
        row["nes_portal_status"] = row.get("nes_portal_status") or "Not Sent"
        row["can_send"] = row["nes_portal_status"] in {"Not Sent", "Queued", "Error"}
        row["can_sync"] = bool(row.get("nes_portal_uuid"))
    return {"items": rows, "count": len(rows)}


@frappe.whitelist()
def send_sales_invoice_to_nes(invoice_name):
    _require_account_access()
    ensure_nes_portal_sales_invoice_fields()
    config = _read_config(include_secret=True)
    if not config.get("enabled"):
        frappe.throw(_("NES Portal entegrasyonu ayarlardan aktif edilmemis."), frappe.ValidationError)
    if not config.get("base_url") or not config.get("access_token") or not config.get("send_path"):
        frappe.throw(_("NES Portal base URL, token ve gonderim yolu zorunludur."), frappe.ValidationError)

    invoice_doc = frappe.get_doc(SALES_INVOICE_DOCTYPE, invoice_name)
    if invoice_doc.docstatus != 1:
        frappe.throw(_("Sadece onayli satis faturalari NES Portal'a gonderilebilir."), frappe.ValidationError)

    payload = _get_invoice_payload(invoice_doc)
    url = _compose_url(config.get("base_url"), config.get("send_path"))
    headers = {
        "Authorization": f"Bearer {config.get('access_token')}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        from frappe.integrations.utils import make_post_request

        response = make_post_request(url, headers=headers, data=json.dumps(payload, ensure_ascii=True))
        status = _extract_status(response)
        return {"status": "ok", "invoice": _set_invoice_status(invoice_name, status, response=response)}
    except Exception as exc:
        error_message = str(exc)[:500]
        invoice = _set_invoice_status(invoice_name, "Error", response={"error": error_message}, error_message=error_message)
        return {"status": "error", "invoice": invoice, "message": error_message}


@frappe.whitelist()
def sync_nes_document_status(invoice_name):
    _require_account_access()
    ensure_nes_portal_sales_invoice_fields()
    config = _read_config(include_secret=True)
    if not config.get("enabled"):
        frappe.throw(_("NES Portal entegrasyonu ayarlardan aktif edilmemis."), frappe.ValidationError)

    uuid = frappe.db.get_value(SALES_INVOICE_DOCTYPE, invoice_name, "nes_portal_uuid")
    if not uuid:
        frappe.throw(_("Durum sorgusu icin NES belge UUID bilgisi yok."), frappe.ValidationError)

    path = str(config.get("status_path") or "").replace("{uuid}", str(uuid))
    url = _compose_url(config.get("base_url"), path)
    headers = {
        "Authorization": f"Bearer {config.get('access_token')}",
        "Accept": "application/json",
    }

    try:
        from frappe.integrations.utils import make_get_request

        response = make_get_request(url, headers=headers)
        status = _extract_status(response)
        return {"status": "ok", "invoice": _set_invoice_status(invoice_name, status, response=response)}
    except Exception as exc:
        error_message = str(exc)[:500]
        invoice = _set_invoice_status(invoice_name, "Error", response={"error": error_message}, error_message=error_message)
        return {"status": "error", "invoice": invoice, "message": error_message}
