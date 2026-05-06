import frappe
from frappe import _
from frappe.utils import now_datetime

# =============================================================================
# Faz A' - Tenant Onboarding Iyilestirmesi
# =============================================================================

PLAN_MODULES = {
    "Starter": {
        "finance": True,
        "sales": True,
        "purchase": False,
        "inventory": True,
        "e_document": False,
        "approval_workflow": False,
        "reports": "basic",
    },
    "Pro": {
        "finance": True,
        "sales": True,
        "purchase": True,
        "inventory": True,
        "e_document": True,
        "approval_workflow": True,
        "reports": "advanced",
    },
    "Enterprise": {
        "finance": True,
        "sales": True,
        "purchase": True,
        "inventory": True,
        "e_document": True,
        "approval_workflow": True,
        "reports": "full",
    },
}

ONBOARDING_STEPS = [
    {
        "step": 1,
        "key": "company_info",
        "label": "Sirket Bilgileri",
        "description": "Temel sirket bilgilerini girin",
        "required_fields": ["company_name", "tax_id", "address"],
    },
    {
        "step": 2,
        "key": "plan_selection",
        "label": "Plan Secimi",
        "description": "Ihtiyaciniza uygun plani secin",
        "required_fields": ["plan"],
    },
    {
        "step": 3,
        "key": "modules",
        "label": "Modul Yapilandirma",
        "description": "Aktif edilecek modulleri secin",
        "required_fields": [],
    },
    {
        "step": 4,
        "key": "account_setup",
        "label": "Hesap Plani",
        "description": "Varsayilan hesap planini olusturun",
        "required_fields": [],
    },
    {
        "step": 5,
        "key": "users",
        "label": "Kullanici Tanimi",
        "description": "Ilk kullanici ve rol atamalari",
        "required_fields": ["first_user_email"],
    },
    {
        "step": 6,
        "key": "complete",
        "label": "Tamamlama",
        "description": "Onboarding tamamlandi",
        "required_fields": [],
    },
]


def _require_admin():
    user_roles = set(frappe.get_roles(frappe.session.user) or [])
    if "System Manager" not in user_roles and "Saas Admin" not in user_roles:
        frappe.throw(_("Bu islem icin admin yetkisi gerekli."), frappe.PermissionError)


def get_onboarding_steps(subdomain: str) -> list[dict]:
    """Tenant icin onboarding adimlarini dondurur"""
    completed_steps = _get_completed_steps(subdomain)
    
    steps = []
    for step_info in ONBOARDING_STEPS:
        step_key = step_info["key"]
        steps.append({
            **step_info,
            "completed": step_key in completed_steps,
            "can_skip": step_key in ["company_info", "plan_selection"] and "Pro" not in PLAN_MODULES,
        })
    
    return steps


def _get_completed_steps(subdomain: str) -> set[str]:
    """Tamamlanmis adimlari getirir"""
    completed = frappe.get_all(
        "Onboarding Checklist",
        filters={"subdomain": subdomain},
        pluck="step_key",
    )
    return set(completed)


def save_onboarding_progress(
    subdomain: str,
    step_key: str,
    data: dict,
) -> dict:
    """Onboarding adim ilerlemesini kaydeder"""
    _require_admin()
    
    existing = frappe.db.exists("Onboarding Checklist", {"subdomain": subdomain, "step_key": step_key})
    
    if existing:
        doc = frappe.get_doc("Onboarding Checklist", existing)
        doc.data = frappe.as_json(data)
        doc.completed_at = now_datetime()
        doc.save(ignore_permissions=True)
    else:
        frappe.get_doc({
            "doctype": "Onboarding Checklist",
            "subdomain": subdomain,
            "step_key": step_key,
            "data": frappe.as_json(data),
            "completed_at": now_datetime(),
        }).insert(ignore_permissions=True)
    
    frappe.db.commit()
    return {"status": "saved", "step_key": step_key}


def get_plan_modules(plan: str) -> dict:
    """Belirli bir planin modul ayarlarini dondurur"""
    return PLAN_MODULES.get(plan, PLAN_MODULES["Starter"])


def update_tenant_plan(subdomain: str, plan: str) -> dict:
    """Tenant planini ve modul ayarlarini gunceller"""
    _require_admin()
    
    if plan not in PLAN_MODULES:
        frappe.throw(_("Gecersiz plan: {}").format(plan), frappe.ValidationError)
    
    if not frappe.db.exists("Tenant Settings", subdomain):
        frappe.throw(_("Tenant bulunamadi."), frappe.DoesNotExistError)
    
    tenant_doc = frappe.get_doc("Tenant Settings", subdomain)
    tenant_doc.plan = plan
    tenant_doc.modules = frappe.as_json(PLAN_MODULES[plan])
    tenant_doc.save(ignore_permissions=True)
    
    frappe.db.commit()
    return {
        "status": "updated",
        "subdomain": subdomain,
        "plan": plan,
        "modules": PLAN_MODULES[plan],
    }


def update_tenant_modules(subdomain: str, modules: dict) -> dict:
    """Tenant modul ayarlarini gunceller"""
    _require_admin()
    
    if not frappe.db.exists("Tenant Settings", subdomain):
        frappe.throw(_("Tenant bulunamadi."), frappe.DoesNotExistError)
    
    tenant_doc = frappe.get_doc("Tenant Settings", subdomain)
    tenant_doc.modules = frappe.as_json(modules)
    tenant_doc.save(ignore_permissions=True)
    
    frappe.db.commit()
    return {"status": "updated", "subdomain": subdomain, "modules": modules}


def create_default_accounts(subdomain: str) -> dict:
    """Tenant icin varsayilan hesap plani olusturur"""
    _require_admin()
    
    default_accounts = [
        {"account_name": "Kasa", "account_type": "Cash", "parent_account": "Hazir Degerler - " + subdomain},
        {"account_name": "Bankalar", "account_type": "Bank", "parent_account": "Hazir Degerler - " + subdomain},
        {"account_name": "Alacaklar", "account_type": "Receivable", "parent_account": "Alacaklar - " + subdomain},
        {"account_name": "Borclar", "account_type": "Payable", "parent_account": "Borclar - " + subdomain},
    ]
    
    created = []
    for acc in default_accounts:
        if not frappe.db.exists("Account", {"account_name": acc["account_name"], "company": subdomain}):
            try:
                doc = frappe.get_doc({
                    "doctype": "Account",
                    "account_name": acc["account_name"],
                    "account_type": acc["account_type"],
                    "parent_account": acc["parent_account"],
                    "company": subdomain,
                }).insert(ignore_permissions=True)
                created.append(doc.name)
            except Exception:
                pass
    
    frappe.db.commit()
    return {
        "status": "created",
        "subdomain": subdomain,
        "accounts_created": len(created),
    }


def complete_onboarding(subdomain: str) -> dict:
    """Onboarding sürecini tamamlar ve tenant'i aktive eder"""
    _require_admin()
    
    if not frappe.db.exists("Tenant Settings", subdomain):
        frappe.throw(_("Tenant bulunamadi."), frappe.DoesNotExistError)
    
    tenant_doc = frappe.get_doc("Tenant Settings", subdomain)
    tenant_doc.onboarding_completed = 1
    tenant_doc.onboarding_completed_at = now_datetime()
    
    if tenant_doc.status == "Trial":
        tenant_doc.status = "Active"
        tenant_doc.activation_date = now_datetime()
    
    tenant_doc.save(ignore_permissions=True)
    frappe.db.commit()
    
    return {
        "status": "completed",
        "subdomain": subdomain,
        "setup_url": f"/app/dashboard?tenant={subdomain}",
    }


def get_onboarding_checklist(subdomain: str) -> dict:
    """Tenant onboarding checklist durumunu dondurur"""
    completed_steps = _get_completed_steps(subdomain)
    
    checklist = []
    for step_info in ONBOARDING_STEPS:
        step_key = step_info["key"]
        checklist.append({
            "step": step_info["step"],
            "key": step_key,
            "label": step_info["label"],
            "description": step_info["description"],
            "completed": step_key in completed_steps,
            "is_required": step_info["step"] <= 2,
        })
    
    overall_progress = (len(completed_steps) / len(ONBOARDING_STEPS)) * 100
    is_complete = all(step["key"] in completed_steps for step in ONBOARDING_STEPS[:5])
    
    return {
        "subdomain": subdomain,
        "steps": checklist,
        "completed_count": len(completed_steps),
        "total_steps": len(ONBOARDING_STEPS),
        "overall_progress": round(overall_progress, 1),
        "is_complete": is_complete,
    }