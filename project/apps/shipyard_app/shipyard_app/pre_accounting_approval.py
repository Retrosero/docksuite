import frappe
from frappe import _
from frappe.utils import now_datetime

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


def _require_authenticated_user():
    if frappe.session.user == "Guest":
        frappe.throw(_("Bu işlem için oturum açmalısınız."), frappe.PermissionError)


def get_approval_level(document_type: str, amount: float) -> int | None:
    thresholds = APPROVAL_THRESHOLDS.get(document_type, {})
    if not thresholds:
        return None
    
    if amount > thresholds.get("level_3", 0):
        return 3
    elif amount > thresholds.get("level_2", 0):
        return 2
    elif amount > thresholds.get("level_1", 0):
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
        frappe.throw(_("Bu işlem onay gerektirmiyor."))
    
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
    frappe.db.commit()
    
    return doc.name


def approve_request(request_name: str, approver_comment: str | None = None) -> dict:
    _require_authenticated_user()
    
    if not frappe.db.exists("Approval Request", request_name):
        frappe.throw(_("Onay talebi bulunamadı."), frappe.DoesNotExistError)
    
    doc = frappe.get_doc("Approval Request", request_name)
    
    if doc.status != "Pending":
        frappe.throw(_("Bu onay talebi zaten işlenmiş."), frappe.ValidationError)
    
    doc.status = "Approved"
    doc.approved_by = frappe.session.user
    doc.approved_at = now_datetime()
    doc.approver_comment = approver_comment
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    
    return {"status": "Approved", "name": doc.name}


def reject_request(request_name: str, rejection_reason: str) -> dict:
    _require_authenticated_user()
    
    if not rejection_reason:
        frappe.throw(_("Red sebebi zorunludur."), frappe.ValidationError)
    
    if not frappe.db.exists("Approval Request", request_name):
        frappe.throw(_("Onay talebi bulunamadı."), frappe.DoesNotExistError)
    
    doc = frappe.get_doc("Approval Request", request_name)
    
    if doc.status != "Pending":
        frappe.throw(_("Bu onay talebi zaten işlenmiş."), frappe.ValidationError)
    
    doc.status = "Rejected"
    doc.approved_by = frappe.session.user
    doc.approved_at = now_datetime()
    doc.rejection_reason = rejection_reason
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    
    return {"status": "Rejected", "name": doc.name}


def get_pending_approvals() -> list[dict]:
    _require_authenticated_user()
    
    user_roles = set(frappe.get_roles(frappe.session.user) or [])
    
    pending = frappe.get_all(
        "Approval Request",
        filters={"status": "Pending"},
        fields=["name", "document_type", "document_name", "amount", "approval_level", "requested_by", "creation"],
        order_by="creation desc",
        limit_page_length=100,
    )
    
    filtered = []
    for req in pending:
        required = (req.get("required_approvers") or "").split(",")
        if any(role in user_roles for role in required if role):
            filtered.append(req)
    
    return filtered


def is_document_approved(document_type: str, document_name: str) -> bool:
    approved = frappe.db.exists(
        "Approval Request",
        {
            "document_type": document_type,
            "document_name": document_name,
            "status": "Approved",
        }
    )
    return bool(approved)
