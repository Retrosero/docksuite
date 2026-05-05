import frappe
from frappe import _


USER_MANAGER_ROLES = {"System Manager", "Accounts Manager"}
PROTECTED_USERS = {"Administrator", "Guest"}
ROLE_TEMPLATES = {
    "muhasebe_sorumlusu": {
        "label": "Muhasebe Sorumlusu",
        "roles": ["Accounts User", "Accounts Manager"],
    },
    "satis_operasyon": {
        "label": "Satış Operasyon",
        "roles": ["Sales User", "Accounts User"],
    },
    "depo_sorumlusu": {
        "label": "Depo Sorumlusu",
        "roles": ["Stock User", "Purchase User"],
    },
    "yonetici": {
        "label": "Yönetici",
        "roles": ["Sales Manager", "Purchase Manager", "Stock Manager", "Accounts Manager"],
    },
    "salt_okuma": {
        "label": "Salt Okuma",
        "roles": ["Employee"],
    },
}
MANAGED_ROLE_SET = set(role for template in ROLE_TEMPLATES.values() for role in template["roles"])


def _require_authenticated_user():
    if frappe.session.user == "Guest":
        frappe.throw(_("Bu işlem için oturum açmalısınız."), frappe.PermissionError)


def _require_user_manager():
    _require_authenticated_user()
    user_roles = set(frappe.get_roles(frappe.session.user) or [])
    if not user_roles.intersection(USER_MANAGER_ROLES):
        frappe.throw(_("Kullanıcı yönetimi için yetkiniz yok."), frappe.PermissionError)


def _validate_template_key(template_key):
    key = (template_key or "").strip()
    if key not in ROLE_TEMPLATES:
        frappe.throw(_("Bilinmeyen rol şablonu."), frappe.ValidationError)
    return key


def _normalize_email(email):
    value = (email or "").strip().lower()
    if not value:
        frappe.throw(_("E-posta zorunludur."), frappe.ValidationError)
    return value


def _get_template_key_for_roles(role_names):
    role_set = set(role_names)
    for key, template in ROLE_TEMPLATES.items():
        if set(template["roles"]) == role_set:
            return key
    return None


def _set_template_roles(user_doc, template_key):
    template_roles = set(ROLE_TEMPLATES[template_key]["roles"])
    remaining_roles = []
    for row in user_doc.roles:
        role = row.role
        if role in MANAGED_ROLE_SET:
            continue
        remaining_roles.append(role)
    user_doc.set("roles", [])
    for role in sorted(set(remaining_roles).union(template_roles)):
        user_doc.append("roles", {"role": role})


def _serialize_user(user_doc):
    user_roles = [row.role for row in user_doc.roles if row.role in MANAGED_ROLE_SET]
    return {
        "email": user_doc.name,
        "full_name": user_doc.full_name or user_doc.name,
        "enabled": bool(user_doc.enabled),
        "role_template": _get_template_key_for_roles(user_roles),
        "managed_roles": sorted(user_roles),
    }


@frappe.whitelist()
def get_user_management_catalog():
    _require_user_manager()
    templates = []
    for key, template in ROLE_TEMPLATES.items():
        templates.append(
            {
                "key": key,
                "label": template["label"],
                "roles": template["roles"],
            }
        )
    return {"templates": templates}


@frappe.whitelist()
def list_company_users():
    _require_user_manager()
    users = frappe.get_all(
        "User",
        filters={"user_type": "System User"},
        fields=["name"],
        order_by="modified desc",
        limit_page_length=300,
    )
    rows = []
    for item in users:
        if item.name in PROTECTED_USERS:
            continue
        user_doc = frappe.get_doc("User", item.name)
        rows.append(_serialize_user(user_doc))
    return {"users": rows}


@frappe.whitelist()
def create_company_user(email=None, first_name=None, last_name=None, role_template=None):
    _require_user_manager()
    user_email = _normalize_email(email)
    if frappe.db.exists("User", user_email):
        frappe.throw(_("Bu e-posta ile kullanıcı zaten var."), frappe.ValidationError)

    template_key = _validate_template_key(role_template)
    first_name = (first_name or "").strip()
    last_name = (last_name or "").strip()
    if not first_name:
        frappe.throw(_("Ad alanı zorunludur."), frappe.ValidationError)

    doc = frappe.get_doc(
        {
            "doctype": "User",
            "email": user_email,
            "first_name": first_name,
            "last_name": last_name,
            "send_welcome_email": 0,
            "enabled": 1,
            "user_type": "System User",
        }
    )
    doc.insert(ignore_permissions=True)
    _set_template_roles(doc, template_key)
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    return {"user": _serialize_user(doc)}


@frappe.whitelist()
def update_company_user_role_template(email=None, role_template=None):
    _require_user_manager()
    user_email = _normalize_email(email)
    if user_email in PROTECTED_USERS:
        frappe.throw(_("Bu kullanıcı için rol değişikliği yapılamaz."), frappe.ValidationError)

    template_key = _validate_template_key(role_template)
    if not frappe.db.exists("User", user_email):
        frappe.throw(_("Kullanıcı bulunamadı."), frappe.DoesNotExistError)

    doc = frappe.get_doc("User", user_email)
    _set_template_roles(doc, template_key)
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    return {"user": _serialize_user(doc)}


@frappe.whitelist()
def set_company_user_enabled(email=None, enabled=1):
    _require_user_manager()
    user_email = _normalize_email(email)
    if user_email in PROTECTED_USERS:
        frappe.throw(_("Bu kullanıcı pasife alınamaz."), frappe.ValidationError)
    if user_email == frappe.session.user and not int(enabled):
        frappe.throw(_("Kendi hesabınızı pasife alamazsınız."), frappe.ValidationError)

    if not frappe.db.exists("User", user_email):
        frappe.throw(_("Kullanıcı bulunamadı."), frappe.DoesNotExistError)

    doc = frappe.get_doc("User", user_email)
    doc.enabled = 1 if int(enabled) else 0
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    return {"user": _serialize_user(doc)}
