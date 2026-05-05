import frappe
from frappe import _
from frappe.utils import getdate, now_datetime, date_diff


def _require_authenticated_user():
    if frappe.session.user == "Guest":
        frappe.throw(_("Bu işlem için oturum açmalısınız."), frappe.PermissionError)


def _require_account_access():
    user_roles = set(frappe.get_roles(frappe.session.user) or [])
    if not any(role in user_roles for role in ["Accounts User", "Accounts Manager", "System Manager"]):
        frappe.throw(_("Bu işlem için muhasebe erişimi gerekli."), frappe.PermissionError)


E_INVOICE_STATUSES = {
    "Draft": "Taslak",
    "Submitted": "Gönderildi",
    "Approved": "Onaylandı",
    "Cancelled": "İptal",
    "Rejected": "Reddedildi",
}

E_INVOICE_DOCTYPES = ["Sales Invoice", "Purchase Invoice", "Payment Entry"]


def get_document_einvoice_status(document_type: str, document_name: str) -> dict | None:
    _require_authenticated_user()
    
    if document_type not in E_INVOICE_DOCTYPES:
        frappe.throw(_("Geçersiz belge türü."), frappe.ValidationError)
    
    status = frappe.db.get_value(
        f"{document_type}",
        document_name,
        "einvoice_status",
    )
    
    if not status:
        return None
    
    return {
        "document_type": document_type,
        "document_name": document_name,
        "status": status,
        "status_label": E_INVOICE_STATUSES.get(status, status),
        "last_updated": frappe.db.get_value(
            f"{document_type}",
            document_name,
            "modified",
        ),
    }


def update_document_einvoice_status(
    document_type: str,
    document_name: str,
    new_status: str,
) -> dict:
    _require_account_access()
    
    if new_status not in E_INVOICE_STATUSES:
        frappe.throw(_("Geçersiz e-Belge durumu."), frappe.ValidationError)
    
    doc = frappe.get_doc(document_type, document_name)
    
    if doc.docstatus != 1 and new_status == "Submitted":
        frappe.throw(_("Onaylı belgeler gönderilebilir."), frappe.ValidationError)
    
    frappe.db.set_value(
        document_type,
        document_name,
        "einvoice_status",
        new_status,
    )
    frappe.db.commit()
    
    return {
        "document_type": document_type,
        "document_name": document_name,
        "status": new_status,
        "status_label": E_INVOICE_STATUSES.get(new_status, new_status),
    }


def run_period_closing_checks(period_start: str, period_end: str) -> dict:
    _require_account_access()
    
    period_start = getdate(period_start)
    period_end = getdate(period_end)
    
    checks = []
    
    checks.append(_check_pending_payments(period_start, period_end))
    checks.append(_check_unapproved_invoices(period_start, period_end))
    checks.append(_check_overdue_transactions(period_start, period_end))
    checks.append(_check_cash_bank_reconciliation(period_start, period_end))
    
    total_checks = len(checks)
    passed_checks = sum(1 for c in checks if c["status"] == "passed")
    
    return {
        "period_start": period_start.strftime("%Y-%m-%d"),
        "period_end": period_end.strftime("%Y-%m-%d"),
        "total_checks": total_checks,
        "passed_checks": passed_checks,
        "failed_checks": total_checks - passed_checks,
        "is_ready_for_closing": passed_checks == total_checks,
        "checks": checks,
    }


def _check_pending_payments(from_date, to_date) -> dict:
    pending = frappe.get_all(
        "Payment Entry",
        filters={
            "posting_date": ["between", [from_date, to_date]],
            "docstatus": 0,
        },
        fields=["name", "payment_type", "party_name"],
    )
    
    return {
        "check_name": "Bekleyen Ödemeler",
        "status": "passed" if not pending else "failed",
        "details": f"{len(pending)} bekleyen ödeme bulundu." if pending else "Tüm ödemeler onaylı.",
        "items": pending,
    }


def _check_unapproved_invoices(from_date, to_date) -> dict:
    unapproved = frappe.get_all(
        "Sales Invoice",
        filters={
            "posting_date": ["between", [from_date, to_date]],
            "docstatus": 0,
        },
        fields=["name", "customer_name", "outstanding_amount"],
    )
    
    return {
        "check_name": "Onaysız Faturalar",
        "status": "passed" if not unapproved else "failed",
        "details": f"{len(unapproved)} onaysız fatura bulundu." if unapproved else "Tüm faturalar onaylı.",
        "items": unapproved,
    }


def _check_overdue_transactions(from_date, to_date) -> dict:
    today = getdate(now_datetime())
    
    overdue = frappe.get_all(
        "Sales Invoice",
        filters={
            "due_date": ["<", from_date],
            "docstatus": 1,
            "outstanding_amount": [">", 0],
        },
        fields=["name", "customer_name", "outstanding_amount", "due_date"],
    )
    
    return {
        "check_name": "Vadesi Geçmiş İşlemler",
        "status": "warning" if overdue else "passed",
        "details": f"{len(overdue)} vadesi geçmiş işlem bulundu." if overdue else "Vadesi geçmiş işlem yok.",
        "items": overdue,
    }


def _check_cash_bank_reconciliation(from_date, to_date) -> dict:
    unreconciled = frappe.get_all(
        "Payment Entry",
        filters={
            "posting_date": ["between", [from_date, to_date]],
            "docstatus": 1,
        },
        fields=["name", "paid_amount", "party_name"],
    )
    
    return {
        "check_name": "Kasa/Banka Mutabakatı",
        "status": "passed" if not unreconciled else "warning",
        "details": f"{len(unreconciled)} mutabakat bekleyen ödeme." if unreconciled else "Tüm ödemeler mutabık.",
        "items": unreconciled,
    }


def get_customer_risk_profile(customer: str) -> dict:
    _require_account_access()
    
    if not frappe.db.exists("Customer", customer):
        frappe.throw(_("Müşteri bulunamadı."), frappe.DoesNotExistError)
    
    customer_doc = frappe.get_doc("Customer", customer)
    credit_limit = customer_doc.get("credit_limit") or 0
    
    outstanding = frappe.db.sql("""
        SELECT SUM(outstanding_amount) as total
        FROM `tabSales Invoice`
        WHERE customer = %s AND docstatus = 1 AND outstanding_amount > 0
    """, (customer,), as_dict=1)
    
    total_outstanding = outstanding[0].total if outstanding else 0
    available_credit = credit_limit - total_outstanding if credit_limit > 0 else None
    
    return {
        "customer": customer,
        "customer_name": customer_doc.customer_name,
        "credit_limit": credit_limit,
        "total_outstanding": total_outstanding,
        "available_credit": available_credit,
        "is_over_limit": available_credit is not None and available_credit < 0,
        "risk_level": _calculate_risk_level(total_outstanding, credit_limit),
    }


def _calculate_risk_level(outstanding: float, credit_limit: float) -> str:
    if credit_limit <= 0:
        return "Bilinmiyor"
    
    ratio = outstanding / credit_limit
    
    if ratio >= 1.0:
        return "Kritik"
    elif ratio >= 0.8:
        return "Yüksek"
    elif ratio >= 0.5:
        return "Orta"
    else:
        return "Düşük"


def get_reconciliation_report(party_type: str, party: str) -> dict:
    _require_account_access()
    
    if party_type not in ["Customer", "Supplier"]:
        frappe.throw(_("Geçersiz taraf türü."), frappe.ValidationError)
    
    invoices = frappe.get_all(
        f"{party_type} Invoice",
        filters={
            "party_type": party_type,
            "party_name": party,
            "docstatus": 1,
            "outstanding_amount": [">", 0],
        },
        fields=["name", "posting_date", "due_date", "outstanding_amount"],
    )
    
    payments = frappe.get_all(
        "Payment Entry Reference",
        filters={
            "reference_name": ["in", [inv.name for inv in invoices]],
        },
        fields=["name", "parent", "allocated_amount", "reference_name"],
    )
    
    return {
        "party_type": party_type,
        "party": party,
        "invoices": invoices,
        "payments": payments,
        "total_outstanding": sum(inv.outstanding_amount for inv in invoices),
    }
