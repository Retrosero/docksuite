import frappe
from frappe import _
from frappe.utils import now_datetime

from shipyard_app import pre_accounting_user_api as user_api

APPROVAL_THRESHOLDS = {
    "sales_invoice": {"level_1": 10000, "level_2": 50000, "level_3": 100000},
    "payment_entry": {"level_1": 10000, "level_2": 50000, "level_3": 100000},
    "purchase_invoice": {"level_1": 10000, "level_2": 50000, "level_3": 100000},
    "expense": {"level_1": 5000, "level_2": 25000, "level_3": 50000},
}

APPROVAL_REQUIRED_ROLES = {
    "level_1": ["muhasebe_sorumlusu"],
    "level_2": ["yonetici"],
    "level_3": ["yonetici"],
}

DOCUMENT_TYPE_MAP = {
    "sales_invoice": "Sales Invoice",
    "payment_entry": "Payment Entry",
    "purchase_invoice": "Purchase Invoice",
    "expense": "Purchase Invoice",
}


def _require_authenticated_user():
    if frappe.session.user == "Guest":
        frappe.throw(_("Bu islem icin oturum acmalisiniz."), frappe.PermissionError)


def _resolve_doctype(document_type: str) -> str | None:
    return DOCUMENT_TYPE_MAP.get((document_type or "").strip().lower())


def _append_document_comment(document_type: str, document_name: str, message: str) -> None:
    doctype_name = _resolve_doctype(document_type)
    if not doctype_name or not document_name or not frappe.db.exists(doctype_name, document_name):
        return
    try:
        doc = frappe.get_doc(doctype_name, document_name)
        doc.add_comment("Comment", message)
    except Exception:
        pass


def get_approval_level(document_type: str, amount: float) -> int | None:
    thresholds = APPROVAL_THRESHOLDS.get(document_type, {})
    if not thresholds:
        return None

    if amount > thresholds.get("level_3", 0):
        return 3
    if amount > thresholds.get("level_2", 0):
        return 2
    if amount > thresholds.get("level_1", 0):
        return 1
    return None


def requires_approval(document_type: str, amount: float) -> bool:
    return get_approval_level(document_type, amount) is not None


def get_required_approvers(level: int) -> list[str]:
    return APPROVAL_REQUIRED_ROLES.get(f"level_{level}", [])


def create_approval_request(
    document_type: str,
    document_name: str,
    amount: float,
    requested_by: str | None = None,
) -> str:
    _require_authenticated_user()

    level = get_approval_level(document_type, amount)
    if not level:
        frappe.throw(_("Bu islem onay gerektirmiyor."))

    approvers = get_required_approvers(level)

    doc = frappe.get_doc(
        {
            "doctype": "Approval Request",
            "document_type": document_type,
            "document_name": document_name,
            "amount": amount,
            "requested_by": requested_by or frappe.session.user,
            "status": "Pending",
            "approval_level": level,
            "required_approvers": ",".join(approvers),
        }
    )
    doc.insert(ignore_permissions=True)
    _append_document_comment(
        document_type,
        document_name,
        _("Onay talebi olusturuldu. Seviye: {0}, Tutar: {1}").format(level, amount),
    )
    frappe.db.commit()
    return doc.name


@frappe.whitelist()
def register_transaction_for_approval(document_type: str, document_name: str, amount: float) -> dict:
    _require_authenticated_user()
    if not document_type or not document_name:
        frappe.throw(_("Belge tipi ve belge no zorunludur."), frappe.ValidationError)
    if amount is None:
        frappe.throw(_("Tutar zorunludur."), frappe.ValidationError)

    amount_value = float(amount)
    if not requires_approval(document_type, amount_value):
        return {"requires_approval": False, "created": False, "request_name": None}

    existing = frappe.db.get_value(
        "Approval Request",
        {"document_type": document_type, "document_name": document_name, "status": "Pending"},
        "name",
    )
    if existing:
        return {"requires_approval": True, "created": False, "request_name": existing}

    request_name = create_approval_request(
        document_type=document_type,
        document_name=document_name,
        amount=amount_value,
    )
    return {"requires_approval": True, "created": True, "request_name": request_name}


@frappe.whitelist()
def approve_request(request_name: str, approver_comment: str | None = None) -> dict:
    _require_authenticated_user()
    if not frappe.db.exists("Approval Request", request_name):
        frappe.throw(_("Onay talebi bulunamadi."), frappe.DoesNotExistError)

    doc = frappe.get_doc("Approval Request", request_name)
    if doc.status != "Pending":
        frappe.throw(_("Bu onay talebi zaten islenmis."), frappe.ValidationError)

    doc.status = "Approved"
    doc.approved_by = frappe.session.user
    doc.approved_at = now_datetime()
    doc.approver_comment = approver_comment
    doc.save(ignore_permissions=True)
    _append_document_comment(
        doc.document_type,
        doc.document_name,
        _("Onay talebi onaylandi. Talep: {0}").format(doc.name),
    )
    frappe.db.commit()
    return {"status": "Approved", "name": doc.name}


@frappe.whitelist()
def reject_request(request_name: str, rejection_reason: str) -> dict:
    _require_authenticated_user()
    if not rejection_reason:
        frappe.throw(_("Red sebebi zorunludur."), frappe.ValidationError)
    if not frappe.db.exists("Approval Request", request_name):
        frappe.throw(_("Onay talebi bulunamadi."), frappe.DoesNotExistError)

    doc = frappe.get_doc("Approval Request", request_name)
    if doc.status != "Pending":
        frappe.throw(_("Bu onay talebi zaten islenmis."), frappe.ValidationError)

    doc.status = "Rejected"
    doc.approved_by = frappe.session.user
    doc.approved_at = now_datetime()
    doc.rejection_reason = rejection_reason
    doc.save(ignore_permissions=True)
    _append_document_comment(
        doc.document_type,
        doc.document_name,
        _("Onay talebi reddedildi. Talep: {0}, Sebep: {1}").format(doc.name, rejection_reason),
    )
    frappe.db.commit()
    return {"status": "Rejected", "name": doc.name}


@frappe.whitelist()
def get_pending_approvals() -> list[dict]:
    _require_authenticated_user()
    user_roles = set(frappe.get_roles(frappe.session.user) or [])

    pending = frappe.get_all(
        "Approval Request",
        filters={"status": "Pending"},
        fields=["name", "document_type", "document_name", "amount", "approval_level", "requested_by", "required_approvers", "creation"],
        order_by="creation desc",
        limit_page_length=100,
    )

    filtered = []
    for req in pending:
        required = (req.get("required_approvers") or "").split(",")
        if any(role in user_roles for role in required if role):
            limit_action_map = {
                "sales_invoice": "submit_sales_invoice",
                "payment_entry": "submit_payment_entry",
                "purchase_invoice": "submit_purchase_invoice",
                "expense": "submit_expense",
            }
            action_key = limit_action_map.get(req.get("document_type"))
            limit_value = None
            source_reason = "Tutar bazli onay esigi"
            if action_key:
                limits = user_api._read_action_limits()
                limit_value = limits.get(action_key)
                if limit_value is not None and float(req.get("amount") or 0) > float(limit_value):
                    source_reason = "Islem limiti asimi"
            req["source_reason"] = source_reason
            req["limit_action_key"] = action_key
            req["limit_value"] = limit_value
            filtered.append(req)
    return filtered


def is_document_approved(document_type: str, document_name: str) -> bool:
    approved = frappe.db.exists(
        "Approval Request",
        {"document_type": document_type, "document_name": document_name, "status": "Approved"},
    )
    return bool(approved)


@frappe.whitelist()
def get_document_approval_state(document_type: str, document_name: str) -> dict:
    _require_authenticated_user()
    if not document_type or not document_name:
        frappe.throw(_("Belge tipi ve belge no zorunludur."), frappe.ValidationError)

    rows = frappe.get_all(
        "Approval Request",
        filters={"document_type": document_type, "document_name": document_name},
        fields=["name", "status", "approval_level", "requested_by", "approved_by", "approved_at", "rejection_reason", "creation"],
        order_by="creation desc",
        limit_page_length=20,
    )
    latest = rows[0] if rows else None
    return {
        "has_request": bool(latest),
        "latest_status": latest.get("status") if latest else None,
        "latest_request_name": latest.get("name") if latest else None,
        "is_blocked_for_submission": bool(latest and latest.get("status") == "Pending"),
        "is_rejected": bool(latest and latest.get("status") == "Rejected"),
        "is_approved": bool(latest and latest.get("status") == "Approved"),
        "history": rows,
    }


@frappe.whitelist()
def get_approval_timeline(limit: int = 100) -> list[dict]:
    _require_authenticated_user()
    rows = frappe.get_all(
        "Approval Request",
        fields=[
            "name",
            "document_type",
            "document_name",
            "amount",
            "status",
            "approval_level",
            "requested_by",
            "approved_by",
            "approved_at",
            "rejection_reason",
            "creation",
        ],
        order_by="modified desc",
        limit_page_length=max(1, min(int(limit or 100), 300)),
    )
    return rows


@frappe.whitelist()
def get_approval_states(document_type: str, document_names=None) -> dict:
    _require_authenticated_user()
    if not document_type:
        frappe.throw(_("Belge tipi zorunludur."), frappe.ValidationError)

    names = document_names
    if isinstance(names, str):
        try:
            names = frappe.parse_json(names)
        except Exception:
            names = [name.strip() for name in names.split(",") if name.strip()]

    if not isinstance(names, list):
        names = []

    names = [str(name).strip() for name in names if str(name).strip()]
    if not names:
        return {"states": {}}

    rows = frappe.get_all(
        "Approval Request",
        filters={"document_type": document_type, "document_name": ["in", names]},
        fields=["document_name", "status", "creation"],
        order_by="creation desc",
        limit_page_length=min(max(len(names) * 3, 50), 1000),
    )

    latest_by_doc = {}
    for row in rows:
        doc_name = row.get("document_name")
        if not doc_name or doc_name in latest_by_doc:
            continue
        latest_by_doc[doc_name] = row.get("status")

    return {"states": latest_by_doc}
