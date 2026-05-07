import json
import hashlib
import hmac
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
    "webhook_secret": "",
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
        "nes_portal_retry_count": _ensure_custom_field(
            SALES_INVOICE_DOCTYPE,
            "nes_portal_retry_count",
            "Int",
            "NES Retry Sayisi",
            default="0",
            insert_after="nes_portal_response",
            read_only=1,
        ),
        "nes_portal_last_retry_at": _ensure_custom_field(
            SALES_INVOICE_DOCTYPE,
            "nes_portal_last_retry_at",
            "Datetime",
            "NES Son Retry Zamani",
            insert_after="nes_portal_retry_count",
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


# =============================================================================
# Faz J: Gelen/Giden Belge Merkezi API'leri
# =============================================================================

NES_DOCUMENT_TYPES = ["e-Fatura", "e-Arsiv", "e-Irsaliye"]
NES_DIRECTION_STATUSES = ["Gonderildi", "Teslim Alindi", "Okundu", "Reddedildi"]


def _ensure_document_log_table():
    """NES Portal Document Log tablosu yoksa olustur."""
    if frappe.db.exists("DocType", "NES Portal Document Log"):
        return True
    
    doc = frappe.get_doc({
        "doctype": "DocType",
        "name": "NES Portal Document Log",
        "module": "Shipyard App",
        "custom": 1,
        "istable": 0,
        "editable_grid": 0,
        "track_changes": 1,
        "fields": [
            {"fieldname": "document_type", "fieldtype": "Select", "label": "Belge Turu", 
             "options": "\n".join(NES_DOCUMENT_TYPES), "in_list_view": 1},
            {"fieldname": "direction", "fieldtype": "Select", "label": "Yon", 
             "options": "Outgoing\nIncoming", "in_list_view": 1},
            {"fieldname": "erp_document_type", "fieldtype": "Link", "label": "ERP Belge Turu", 
             "options": "DocType"},
            {"fieldname": "erp_document_name", "fieldtype": "Data", "label": "ERP Belge Adi", 
             "in_list_view": 1},
            {"fieldname": "nes_uuid", "fieldtype": "Data", "label": "NES Belge UUID", 
             "in_list_view": 1},
            {"fieldname": "nes_status", "fieldtype": "Select", "label": "NES Durumu", 
             "options": "\n".join(NES_STATUSES), "in_list_view": 1},
            {"fieldname": "direction_status", "fieldtype": "Select", "label": "Yon Durumu", 
             "options": "\n".join(NES_DIRECTION_STATUSES)},
            {"fieldname": "raw_request", "fieldtype": "Code", "label": "Ham Istek", 
             "options": "JSON"},
            {"fieldname": "raw_response", "fieldtype": "Code", "label": "Ham Yanit", 
             "options": "JSON"},
            {"fieldname": "error_message", "fieldtype": "Small Text", "label": "Hata Mesaji"},
            {"fieldname": "callback_received_at", "fieldtype": "Datetime", "label": "Callback Zamani"},
            {"fieldname": "last_sync_at", "fieldtype": "Datetime", "label": "Son Senkron"},
            {"fieldname": "metadata", "fieldtype": "Code", "label": "Metadata", 
             "options": "JSON"},
        ],
        "permissions": [
            {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1},
        ],
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return True


def _create_document_log(payload):
    """Belge log kaydi olustur."""
    _ensure_document_log_table()
    log = frappe.get_doc({
        "doctype": "NES Portal Document Log",
        "document_type": payload.get("document_type", "e-Fatura"),
        "direction": payload.get("direction", "Outgoing"),
        "erp_document_type": payload.get("erp_document_type"),
        "erp_document_name": payload.get("erp_document_name"),
        "nes_uuid": payload.get("nes_uuid"),
        "nes_status": payload.get("nes_status", "Sent"),
        "direction_status": payload.get("direction_status", "Gonderildi"),
        "raw_request": json.dumps(payload.get("raw_request", {}), ensure_ascii=True, default=str),
        "raw_response": json.dumps(payload.get("raw_response", {}), ensure_ascii=True, default=str),
        "error_message": payload.get("error_message", ""),
        "callback_received_at": payload.get("callback_received_at"),
        "last_sync_at": now_datetime(),
        "metadata": json.dumps(payload.get("metadata", {}), ensure_ascii=True, default=str),
    })
    log.insert(ignore_permissions=True)
    frappe.db.commit()
    return log


def _safe_json_load(value):
    if not value:
        return {}
    if isinstance(value, dict):
        return value
    try:
        return json.loads(value)
    except Exception:
        return {}


def _get_default_company():
    company = frappe.defaults.get_user_default("Company")
    if company:
        return company
    rows = frappe.get_all("Company", fields=["name"], limit_page_length=1)
    return rows[0]["name"] if rows else None


def _get_default_supplier():
    rows = frappe.get_all("Supplier", fields=["name", "supplier_name"], limit_page_length=1)
    if rows:
        return rows[0]["name"], rows[0].get("supplier_name") or rows[0]["name"]
    return None, None


def _extract_incoming_invoice_payload(log_row):
    raw_response = _safe_json_load(log_row.get("raw_response"))
    metadata = _safe_json_load(log_row.get("metadata"))
    supplier_title = (
        metadata.get("supplier_name")
        or raw_response.get("supplier_name")
        or raw_response.get("vendor_name")
        or "NES Gelen Belge"
    )
    grand_total = (
        metadata.get("grand_total")
        or raw_response.get("grand_total")
        or raw_response.get("total")
        or 0
    )
    try:
        amount = float(grand_total or 0)
    except Exception:
        amount = 0.0
    return {"supplier_title": supplier_title, "amount": amount}


@frappe.whitelist()
def get_sent_documents(limit=50, document_type=None, status=None):
    """Giden belgeleri listele."""
    _require_account_access()
    ensure_nes_portal_sales_invoice_fields()
    limit = max(1, min(int(limit or 50), 200))
    
    filters = {"docstatus": 1}
    if status:
        filters["nes_portal_status"] = status
    
    fields = [
        "name", "customer", "customer_name", "posting_date", "due_date",
        "grand_total", "currency", "nes_portal_status", "nes_portal_uuid",
        "nes_portal_last_sync_at", "nes_portal_error", "docstatus",
        "nes_portal_retry_count", "nes_portal_last_retry_at",
    ]
    
    rows = frappe.get_all(
        SALES_INVOICE_DOCTYPE,
        filters=filters,
        fields=fields,
        order_by="posting_date desc, modified desc",
        limit_page_length=limit,
    )
    
    result = []
    for row in rows:
        doc_type = "e-Fatura"
        if document_type:
            doc_type = document_type
        
        result.append({
            "id": row["name"],
            "document_type": doc_type,
            "direction": "Outgoing",
            "erp_document_type": SALES_INVOICE_DOCTYPE,
            "erp_document_name": row["name"],
            "customer": row.get("customer"),
            "customer_name": row.get("customer_name"),
            "posting_date": str(row.get("posting_date") or ""),
            "due_date": str(row.get("due_date") or ""),
            "grand_total": float(row.get("grand_total") or 0),
            "currency": row.get("currency"),
            "nes_status": row.get("nes_portal_status") or "Not Sent",
            "nes_uuid": row.get("nes_portal_uuid"),
            "last_sync_at": str(row.get("nes_portal_last_sync_at") or ""),
            "error_message": row.get("nes_portal_error"),
            "retry_count": int(row.get("nes_portal_retry_count") or 0),
            "last_retry_at": str(row.get("nes_portal_last_retry_at") or ""),
            "can_send": row.get("nes_portal_status") in {"Not Sent", "Queued", "Error"},
            "can_sync": bool(row.get("nes_portal_uuid")),
            "can_reject": row.get("nes_portal_status") in {"Sent", "Accepted"},
            "can_cancel": row.get("nes_portal_status") in {"Sent", "Accepted"},
        })
    
    return {"items": result, "count": len(result)}


@frappe.whitelist()
def get_received_documents(limit=50, document_type=None, status=None):
    """Gelen belgeleri listele."""
    _require_account_access()
    _ensure_document_log_table()
    limit = max(1, min(int(limit or 50), 200))
    
    filters = {"direction": "Incoming"}
    if document_type:
        filters["document_type"] = document_type
    if status:
        filters["nes_status"] = status
    
    rows = frappe.get_all(
        "NES Portal Document Log",
        filters=filters,
        fields=[
            "name", "document_type", "erp_document_type", "erp_document_name",
            "nes_uuid", "nes_status", "direction_status", "callback_received_at",
            "last_sync_at", "error_message", "metadata",
        ],
        order_by="callback_received_at desc",
        limit_page_length=limit,
    )
    
    result = []
    for row in rows:
        metadata = _safe_json_load(row.get("metadata"))
        linked_purchase_invoice = metadata.get("linked_purchase_invoice")
        is_convertible_type = row.get("document_type") in {"e-Fatura", "e-Irsaliye"}
        result.append({
            "id": row["name"],
            "document_type": row.get("document_type", "e-Fatura"),
            "direction": "Incoming",
            "erp_document_type": row.get("erp_document_type"),
            "erp_document_name": row.get("erp_document_name"),
            "nes_uuid": row.get("nes_uuid"),
            "nes_status": row.get("nes_status"),
            "direction_status": row.get("direction_status"),
            "received_at": str(row.get("callback_received_at") or ""),
            "last_sync_at": str(row.get("last_sync_at") or ""),
            "error_message": row.get("error_message"),
            "can_accept": row.get("nes_status") == "Queued",
            "can_reject": row.get("nes_status") == "Queued",
            "can_convert": bool(is_convertible_type and not linked_purchase_invoice),
            "linked_purchase_invoice": linked_purchase_invoice,
        })
    
    return {"items": result, "count": len(result)}


@frappe.whitelist()
def get_document_history(document_name, document_type="Sales Invoice"):
    """Belge geçmisini getir."""
    _require_account_access()
    _ensure_document_log_table()
    
    logs = frappe.get_all(
        "NES Portal Document Log",
        filters={
            "erp_document_name": document_name,
        },
        fields=[
            "name", "document_type", "direction", "nes_status", "direction_status",
            "callback_received_at", "last_sync_at", "error_message", "raw_response",
        ],
        order_by="creation desc",
    )
    
    return {"logs": logs}


@frappe.whitelist(allow_guest=True)
def nes_portal_webhook():
    """NES Portal'dan gelen webhook/callback'i isle."""
    try:
        config = _read_config(include_secret=True)
        raw_data = frappe.request.get_data()
        if isinstance(raw_data, bytes):
            raw_text = raw_data.decode("utf-8")
            raw_bytes = raw_data
        else:
            raw_text = raw_data or ""
            raw_bytes = raw_text.encode("utf-8")

        # Optional webhook verification: when tenant sets secret, callback must pass.
        webhook_secret = (config.get("webhook_secret") or "").strip()
        if webhook_secret:
            signature_header = (
                frappe.get_request_header("X-NES-Signature")
                or frappe.get_request_header("X-Signature")
                or frappe.get_request_header("X-Hub-Signature-256")
                or ""
            ).strip()
            token_header = (
                frappe.get_request_header("X-Webhook-Token")
                or frappe.get_request_header("Authorization")
                or ""
            ).strip()
            expected_signature = hmac.new(
                webhook_secret.encode("utf-8"),
                raw_bytes,
                hashlib.sha256,
            ).hexdigest()
            signed_ok = False
            if signature_header:
                normalized_signature = signature_header.removeprefix("sha256=").strip().lower()
                signed_ok = hmac.compare_digest(normalized_signature, expected_signature.lower())
            token_ok = hmac.compare_digest(token_header, webhook_secret)
            if not signed_ok and not token_ok:
                frappe.throw(_("Webhook imza dogrulamasi basarisiz."), frappe.PermissionError)

        try:
            payload = json.loads(raw_text)
        except json.JSONDecodeError:
            payload = {"raw": raw_text}
        
        _ensure_document_log_table()
        
        doc_type = payload.get("document_type", "e-Fatura")
        uuid = payload.get("uuid") or payload.get("ettn") or payload.get("id")
        status = payload.get("status") or payload.get("state")
        error = payload.get("error") or payload.get("error_message")
        
        nes_status = _normalise_status(status) if status else "Sent"
        
        log_payload = {
            "document_type": doc_type,
            "direction": "Incoming",
            "nes_uuid": uuid,
            "nes_status": nes_status,
            "direction_status": "Teslim Alindi" if nes_status == "Accepted" else "Okundu",
            "raw_request": payload,
            "callback_received_at": now_datetime(),
            "error_message": error,
        }
        
        _create_document_log(log_payload)
        
        if uuid:
            matching_invoices = frappe.get_all(
                SALES_INVOICE_DOCTYPE,
                filters={"nes_portal_uuid": uuid},
                fields=["name"],
                limit=1,
            )
            if matching_invoices:
                _set_invoice_status(matching_invoices[0]["name"], nes_status, response=payload, error_message=error)
        
        return {"status": "ok", "message": "Webhook islendi"}
        
    except Exception as exc:
        frappe.log_error(f"NES Portal Webhook Error: {str(exc)}", "NES Portal Webhook")
        return {"status": "error", "message": str(exc)}


@frappe.whitelist()
def reject_nes_document(document_name, reason="", document_type="Sales Invoice"):
    """Belgeyi reddet."""
    _require_account_access()
    ensure_nes_portal_sales_invoice_fields()
    
    if document_type == "Sales Invoice":
        current_status = frappe.db.get_value(SALES_INVOICE_DOCTYPE, document_name, "nes_portal_status")
        if current_status not in {"Sent", "Accepted"}:
            frappe.throw(_("Sadece gonderilmis veya kabul edilmis belgeler reddedilebilir."), frappe.ValidationError)
        
        _set_invoice_status(document_name, "Rejected", error_message=reason)
        
        _ensure_document_log_table()
        _create_document_log({
            "document_type": "e-Fatura",
            "direction": "Outgoing",
            "erp_document_type": SALES_INVOICE_DOCTYPE,
            "erp_document_name": document_name,
            "nes_status": "Rejected",
            "direction_status": "Reddedildi",
            "error_message": reason,
        })
        
        return {"status": "ok", "message": "Belge reddedildi", "document": document_name}
    
    return {"status": "error", "message": "Desteklenmeyen belge turu"}


@frappe.whitelist()
def cancel_nes_document(document_name, reason="", document_type="Sales Invoice"):
    """Belgeyi iptal et."""
    _require_account_access()
    ensure_nes_portal_sales_invoice_fields()
    
    if document_type == "Sales Invoice":
        current_status = frappe.db.get_value(SALES_INVOICE_DOCTYPE, document_name, "nes_portal_status")
        if current_status not in {"Sent", "Accepted", "Rejected"}:
            frappe.throw(_("Iptal edilebilir durumda belge yok."), frappe.ValidationError)
        
        uuid = frappe.db.get_value(SALES_INVOICE_DOCTYPE, document_name, "nes_portal_uuid")
        
        _set_invoice_status(document_name, "Cancelled", error_message=reason)
        
        _ensure_document_log_table()
        _create_document_log({
            "document_type": "e-Fatura",
            "direction": "Outgoing",
            "erp_document_type": SALES_INVOICE_DOCTYPE,
            "erp_document_name": document_name,
            "nes_uuid": uuid,
            "nes_status": "Cancelled",
            "direction_status": "Reddedildi",
            "error_message": reason,
        })
        
        return {"status": "ok", "message": "Belge iptal edildi", "document": document_name}
    
    return {"status": "error", "message": "Desteklenmeyen belge turu"}


@frappe.whitelist()
def return_nes_document(document_name, reason="", document_type="Sales Invoice"):
    """Belgeyi iade et."""
    _require_account_access()
    ensure_nes_portal_sales_invoice_fields()
    
    if document_type == "Sales Invoice":
        current_status = frappe.db.get_value(SALES_INVOICE_DOCTYPE, document_name, "nes_portal_status")
        if current_status not in {"Accepted"}:
            frappe.throw(_("Sadece kabul edilmis belgeler iade edilebilir."), frappe.ValidationError)
        
        uuid = frappe.db.get_value(SALES_INVOICE_DOCTYPE, document_name, "nes_portal_uuid")
        
        _set_invoice_status(document_name, "Error", error_message=f"Iade: {reason}")
        
        _ensure_document_log_table()
        _create_document_log({
            "document_type": "e-Fatura",
            "direction": "Outgoing",
            "erp_document_type": SALES_INVOICE_DOCTYPE,
            "erp_document_name": document_name,
            "nes_uuid": uuid,
            "nes_status": "Error",
            "direction_status": "Reddedildi",
            "error_message": f"Iade: {reason}",
        })
        
        return {"status": "ok", "message": "Belge iade edildi", "document": document_name}
    
    return {"status": "error", "message": "Desteklenmeyen belge turu"}


@frappe.whitelist()
def resend_nes_document(document_name, document_type="Sales Invoice"):
    """Belgeyi tekrar gonder."""
    _require_account_access()
    ensure_nes_portal_sales_invoice_fields()
    
    if document_type == "Sales Invoice":
        current_status = frappe.db.get_value(SALES_INVOICE_DOCTYPE, document_name, "nes_portal_status")
        if current_status not in {"Not Sent", "Queued", "Error", "Rejected", "Cancelled"}:
            frappe.throw(_("Bu belirtki tekrar gonderilemez."), frappe.ValidationError)
        
        result = send_sales_invoice_to_nes(document_name)
        
        _ensure_document_log_table()
        _create_document_log({
            "document_type": "e-Fatura",
            "direction": "Outgoing",
            "erp_document_type": SALES_INVOICE_DOCTYPE,
            "erp_document_name": document_name,
            "nes_status": result.get("invoice", {}).get("nes_portal_status", "Sent"),
            "direction_status": "Gonderildi",
        })
        
        return result
    
    return {"status": "error", "message": "Desteklenmeyen belge turu"}


@frappe.whitelist()
def retry_failed_nes_documents(limit=20, document_type="Sales Invoice"):
    """Hata/kuyruk durumundaki belgeleri toplu olarak tekrar gonder."""
    _require_account_access()
    ensure_nes_portal_sales_invoice_fields()

    if document_type != "Sales Invoice":
        return {"status": "error", "message": "Desteklenmeyen belge turu"}

    try:
        batch_limit = max(1, min(int(limit), 100))
    except (TypeError, ValueError):
        batch_limit = 20

    retry_statuses = {"Not Sent", "Queued", "Error", "Rejected", "Cancelled"}
    candidates = frappe.get_all(
        SALES_INVOICE_DOCTYPE,
        filters={
            "docstatus": 1,
            "nes_portal_status": ["in", list(retry_statuses)],
        },
        fields=["name", "nes_portal_status"],
        order_by="modified asc",
        limit=batch_limit,
    )

    retried = []
    failed = []
    for row in candidates:
        invoice_name = row.get("name")
        current_retry_count = int(
            frappe.db.get_value(SALES_INVOICE_DOCTYPE, invoice_name, "nes_portal_retry_count") or 0
        )
        frappe.db.set_value(
            SALES_INVOICE_DOCTYPE,
            invoice_name,
            {
                "nes_portal_retry_count": current_retry_count + 1,
                "nes_portal_last_retry_at": now_datetime(),
            },
            update_modified=False,
        )
        try:
            resend_nes_document(invoice_name, document_type=document_type)
            retried.append(invoice_name)
        except Exception as exc:
            failed.append({"invoice": invoice_name, "error": str(exc)})

    return {
        "status": "ok",
        "message": f"{len(retried)} belge tekrar denendi, {len(failed)} hata olustu.",
        "retried_count": len(retried),
        "failed_count": len(failed),
        "retried": retried,
        "failed": failed,
    }


@frappe.whitelist()
def convert_received_document_to_purchase_invoice(log_name, company=None):
    """Convert incoming NES document log row to draft Purchase Invoice."""
    _require_account_access()
    _ensure_document_log_table()
    if not frappe.db.exists("NES Portal Document Log", log_name):
        frappe.throw(_("Gelen belge kaydi bulunamadi."), frappe.DoesNotExistError)

    log_row = frappe.get_doc("NES Portal Document Log", log_name)
    if log_row.direction != "Incoming":
        frappe.throw(_("Sadece gelen belgeler donusturulebilir."), frappe.ValidationError)
    if log_row.document_type not in {"e-Fatura", "e-Irsaliye"}:
        frappe.throw(_("Bu belge turu alis faturasina donusturulemez."), frappe.ValidationError)

    metadata = _safe_json_load(log_row.metadata)
    if metadata.get("linked_purchase_invoice"):
        return {
            "status": "ok",
            "purchase_invoice": metadata.get("linked_purchase_invoice"),
            "message": "Belge daha once donusturulmus.",
        }

    selected_company = company or _get_default_company()
    if not selected_company:
        frappe.throw(_("Donusum icin Company kaydi bulunamadi."), frappe.ValidationError)

    supplier_code, supplier_title = _get_default_supplier()
    if not supplier_code:
        frappe.throw(_("Donusum icin en az bir Supplier kaydi gereklidir."), frappe.ValidationError)

    payload = _extract_incoming_invoice_payload(
        {
            "raw_response": log_row.raw_response,
            "metadata": log_row.metadata,
        }
    )
    amount = float(payload.get("amount") or 0)
    if amount <= 0:
        amount = 1.0

    purchase_invoice = frappe.get_doc(
        {
            "doctype": "Purchase Invoice",
            "company": selected_company,
            "supplier": supplier_code,
            "posting_date": frappe.utils.today(),
            "bill_no": log_row.nes_uuid or log_row.name,
            "remarks": f"NES gelen belge donusumu: {log_row.name} - {supplier_title}",
            "items": [
                {
                    "item_name": f"NES Gelen Belge - {log_row.document_type}",
                    "description": payload.get("supplier_title") or supplier_title,
                    "qty": 1,
                    "rate": amount,
                    "amount": amount,
                }
            ],
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()

    metadata["linked_purchase_invoice"] = purchase_invoice.name
    log_row.metadata = json.dumps(metadata, ensure_ascii=True, default=str)
    log_row.save(ignore_permissions=True)
    frappe.db.commit()

    return {
        "status": "ok",
        "purchase_invoice": purchase_invoice.name,
        "message": "Gelen belge taslak alis faturasina donusturuldu.",
    }
