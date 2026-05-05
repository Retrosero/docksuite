import frappe
from frappe import _
from frappe.utils import now_datetime, random_string, get_url

TENANT_DEFAULTS = {
    "currency": "TRY",
    "country": "Turkey",
    "timezone": "Europe/Istanbul",
    "fiscal_year_start": "01-01",
    "fiscal_year_end": "12-31",
    "default_payment_terms": "Net 30",
    "tax_rate": 20,
}

DEFAULT_ROLE_TEMPLATES = [
    {
        "role_template": "yonetici",
        "roles": "System Manager,Accounts Manager,Sales Manager,Purchase Manager,Stock Manager",
    },
    {
        "role_template": "muhasebe_sorumlusu",
        "roles": "Accounts User,Accounts Manager",
    },
    {
        "role_template": "satis_operasyon",
        "roles": "Sales User,Accounts User",
    },
    {
        "role_template": "depo_sorumlusu",
        "roles": "Stock User,Purchase User",
    },
    {
        "role_template": "salt_okuma",
        "roles": "Employee",
    },
]


def _require_system_manager():
    user_roles = set(frappe.get_roles(frappe.session.user) or [])
    if "System Manager" not in user_roles:
        frappe.throw(_("Bu işlem için Sistem Yöneticisi yetkisi gerekli."), frappe.PermissionError)


def create_tenant(
    company_name: str,
    subdomain: str,
    email: str,
    phone: str | None = None,
    tax_id: str | None = None,
    address: str | None = None,
) -> dict:
    _require_system_manager()
    
    if not company_name or not subdomain or not email:
        frappe.throw(_("Şirket adı, subdomain ve e-posta zorunludur."), frappe.ValidationError)
    
    if frappe.db.exists("Tenant Settings", subdomain):
        frappe.throw(_("Bu subdomain zaten kullanılmaktadır."), frappe.ValidationError)
    
    tenant_doc = frappe.get_doc({
        "doctype": "Tenant Settings",
        "subdomain": subdomain,
        "company_name": company_name,
        "email": email,
        "phone": phone,
        "tax_id": tax_id,
        "address": address,
        "status": "Trial",
        "trial_ends": frappe.utils.add_days(now_datetime(), 14),
    })
    tenant_doc.insert(ignore_permissions=True)
    
    _create_tenant_defaults(subdomain)
    _create_tenant_admin_user(subdomain, email, company_name)
    
    frappe.db.commit()
    
    return {
        "name": tenant_doc.name,
        "subdomain": subdomain,
        "status": tenant_doc.status,
        "setup_url": get_url(f"/app/setup?tenant={subdomain}"),
    }


def _create_tenant_defaults(subdomain: str) -> None:
    for template in DEFAULT_ROLE_TEMPLATES:
        if not frappe.db.exists("Role Template", template["role_template"]):
            frappe.get_doc({
                "doctype": "Role Template",
                "role_template": template["role_template"],
                "roles": template["roles"],
            }).insert(ignore_permissions=True)
    
    for key, value in TENANT_DEFAULTS.items():
        setting_key = f"{subdomain}_{key}"
        if not frappe.db.exists("Singles", setting_key):
            frappe.db.set_value("Singles", setting_key, "value", value)


def _create_tenant_admin_user(subdomain: str, email: str, company_name: str) -> str:
    user = frappe.get_doc({
        "doctype": "User",
        "email": email,
        "first_name": company_name,
        "user_type": "Website User",
        "enabled": 1,
        "send_welcome_email": 1,
    })
    user.insert(ignore_permissions=True)
    
    frappe.get_doc({
        "doctype": "UserRole",
        "user": email,
        "role": "System Manager",
    }).insert(ignore_permissions=True)
    
    return user.name


def activate_tenant(subdomain: str) -> dict:
    _require_system_manager()
    
    if not frappe.db.exists("Tenant Settings", subdomain):
        frappe.throw(_("Tenant bulunamadı."), frappe.DoesNotExistError)
    
    doc = frappe.get_doc("Tenant Settings", subdomain)
    doc.status = "Active"
    doc.activation_date = now_datetime()
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    
    return {"status": "Active", "subdomain": subdomain}


def suspend_tenant(subdomain: str, reason: str | None = None) -> dict:
    _require_system_manager()
    
    if not frappe.db.exists("Tenant Settings", subdomain):
        frappe.throw(_("Tenant bulunamadı."), frappe.DoesNotExistError)
    
    doc = frappe.get_doc("Tenant Settings", subdomain)
    doc.status = "Suspended"
    doc.suspension_reason = reason
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    
    return {"status": "Suspended", "subdomain": subdomain}


def get_tenant_info(subdomain: str) -> dict | None:
    if not frappe.db.exists("Tenant Settings", subdomain):
        return None
    
    doc = frappe.get_doc("Tenant Settings", subdomain)
    return {
        "name": doc.name,
        "subdomain": doc.subdomain,
        "company_name": doc.company_name,
        "status": doc.status,
        "trial_ends": doc.trial_ends,
        "activation_date": doc.activation_date,
    }


def list_tenants(status: str | None = None) -> list[dict]:
    _require_system_manager()
    
    filters = {}
    if status:
        filters["status"] = status
    
    tenants = frappe.get_all(
        "Tenant Settings",
        filters=filters,
        fields=["name", "subdomain", "company_name", "email", "status", "trial_ends", "creation"],
        order_by="creation desc",
    )
    return tenants
