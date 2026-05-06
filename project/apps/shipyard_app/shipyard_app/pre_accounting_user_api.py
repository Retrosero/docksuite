import json

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
SCREEN_ACCESS_DEFAULT_KEY = "pre_accounting_screen_access_matrix"
ACTION_ACCESS_DEFAULT_KEY = "pre_accounting_action_access_matrix"
ACTION_LIMITS_DEFAULT_KEY = "pre_accounting_action_limit_matrix"
SCREEN_ACCESS_ROUTE_KEYS = [
    "dashboard",
    "cari",
    "musteriler",
    "urunler",
    "satis",
    "tahsilat",
    "alis",
    "gider",
    "kasa-banka",
    "stok",
    "onaylar",
    "raporlar",
    "kullanicilar",
    "gun-sonu",
    "donem-kapanis",
    "tenant-yonetimi",
    "ayarlar",
]
DEFAULT_ALLOWED_TEMPLATES_BY_ROUTE = {
    "dashboard": ["yonetici", "muhasebe_sorumlusu", "satis_operasyon", "depo_sorumlusu", "salt_okuma"],
    "cari": ["yonetici", "muhasebe_sorumlusu", "satis_operasyon", "depo_sorumlusu", "salt_okuma"],
    "musteriler": ["yonetici", "muhasebe_sorumlusu", "satis_operasyon", "depo_sorumlusu", "salt_okuma"],
    "urunler": ["yonetici", "muhasebe_sorumlusu", "satis_operasyon", "depo_sorumlusu", "salt_okuma"],
    "satis": ["yonetici", "muhasebe_sorumlusu", "satis_operasyon", "salt_okuma"],
    "tahsilat": ["yonetici", "muhasebe_sorumlusu", "satis_operasyon", "salt_okuma"],
    "alis": ["yonetici", "muhasebe_sorumlusu", "salt_okuma"],
    "gider": ["yonetici", "muhasebe_sorumlusu", "salt_okuma"],
    "kasa-banka": ["yonetici", "muhasebe_sorumlusu"],
    "stok": ["yonetici", "muhasebe_sorumlusu", "satis_operasyon", "depo_sorumlusu", "salt_okuma"],
    "onaylar": ["yonetici", "muhasebe_sorumlusu"],
    "raporlar": ["yonetici", "muhasebe_sorumlusu", "salt_okuma"],
    "kullanicilar": ["yonetici", "muhasebe_sorumlusu"],
    "gun-sonu": ["yonetici", "muhasebe_sorumlusu"],
    "donem-kapanis": ["yonetici", "muhasebe_sorumlusu"],
    "tenant-yonetimi": ["yonetici"],
    "ayarlar": ["yonetici", "muhasebe_sorumlusu"],
}
ACTION_KEYS = [
    "create_sales_invoice",
    "submit_sales_invoice",
    "cancel_sales_invoice",
    "create_purchase_invoice",
    "submit_purchase_invoice",
    "create_payment_entry",
    "submit_payment_entry",
    "create_transfer",
    "submit_transfer",
    "create_expense",
    "submit_expense",
    "manage_users",
    "update_settings",
]
DEFAULT_ALLOWED_TEMPLATES_BY_ACTION = {
    "create_sales_invoice": ["yonetici", "muhasebe_sorumlusu", "satis_operasyon"],
    "submit_sales_invoice": ["yonetici", "muhasebe_sorumlusu"],
    "cancel_sales_invoice": ["yonetici", "muhasebe_sorumlusu"],
    "create_purchase_invoice": ["yonetici", "muhasebe_sorumlusu"],
    "submit_purchase_invoice": ["yonetici", "muhasebe_sorumlusu"],
    "create_payment_entry": ["yonetici", "muhasebe_sorumlusu", "satis_operasyon"],
    "submit_payment_entry": ["yonetici", "muhasebe_sorumlusu"],
    "create_transfer": ["yonetici"],
    "submit_transfer": ["yonetici", "muhasebe_sorumlusu"],
    "create_expense": ["yonetici", "muhasebe_sorumlusu"],
    "submit_expense": ["yonetici"],
    "manage_users": ["yonetici", "muhasebe_sorumlusu"],
    "update_settings": ["yonetici", "muhasebe_sorumlusu"],
}
DEFAULT_ACTION_LIMITS = {
    "submit_sales_invoice": 50000,
    "submit_payment_entry": 50000,
    "create_transfer": 25000,
    "submit_expense": 25000,
}


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


def _build_default_screen_access_matrix():
    matrix = {}
    for template_key in ROLE_TEMPLATES:
        matrix[template_key] = {}
        for route_key in SCREEN_ACCESS_ROUTE_KEYS:
            matrix[template_key][route_key] = template_key in DEFAULT_ALLOWED_TEMPLATES_BY_ROUTE.get(route_key, [])
    return matrix


def _read_screen_access_matrix():
    raw = frappe.defaults.get_global_default(SCREEN_ACCESS_DEFAULT_KEY)
    default_matrix = _build_default_screen_access_matrix()
    if not raw:
        return default_matrix

    try:
        parsed = json.loads(raw)
    except (TypeError, ValueError):
        return default_matrix

    if not isinstance(parsed, dict):
        return default_matrix

    matrix = _build_default_screen_access_matrix()
    for template_key in ROLE_TEMPLATES:
        template_rows = parsed.get(template_key)
        if not isinstance(template_rows, dict):
            continue
        for route_key in SCREEN_ACCESS_ROUTE_KEYS:
            if route_key in template_rows:
                matrix[template_key][route_key] = bool(template_rows[route_key])
    return matrix


def _build_default_action_access_matrix():
    matrix = {}
    for template_key in ROLE_TEMPLATES:
        matrix[template_key] = {}
        for action_key in ACTION_KEYS:
            matrix[template_key][action_key] = template_key in DEFAULT_ALLOWED_TEMPLATES_BY_ACTION.get(action_key, [])
    return matrix


def _read_action_access_matrix():
    raw = frappe.defaults.get_global_default(ACTION_ACCESS_DEFAULT_KEY)
    if not raw:
        return _build_default_action_access_matrix()
    try:
        parsed = json.loads(raw)
    except (TypeError, ValueError):
        return _build_default_action_access_matrix()
    if not isinstance(parsed, dict):
        return _build_default_action_access_matrix()

    matrix = _build_default_action_access_matrix()
    for template_key in ROLE_TEMPLATES:
        template_rows = parsed.get(template_key)
        if not isinstance(template_rows, dict):
            continue
        for action_key in ACTION_KEYS:
            if action_key in template_rows:
                matrix[template_key][action_key] = bool(template_rows[action_key])
    return matrix


def _read_action_limits():
    raw = frappe.defaults.get_global_default(ACTION_LIMITS_DEFAULT_KEY)
    if not raw:
        return DEFAULT_ACTION_LIMITS.copy()
    try:
        parsed = json.loads(raw)
    except (TypeError, ValueError):
        return DEFAULT_ACTION_LIMITS.copy()
    if not isinstance(parsed, dict):
        return DEFAULT_ACTION_LIMITS.copy()

    limits = DEFAULT_ACTION_LIMITS.copy()
    for action_key in ACTION_KEYS:
        if action_key not in parsed:
            continue
        value = parsed.get(action_key)
        if value is None or value == "":
            limits[action_key] = None
            continue
        try:
            limits[action_key] = float(value)
        except (TypeError, ValueError):
            continue
    return limits


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


@frappe.whitelist()
def get_screen_access_matrix():
    _require_user_manager()
    return {"matrix": _read_screen_access_matrix(), "routes": SCREEN_ACCESS_ROUTE_KEYS}


@frappe.whitelist()
def save_screen_access_rule(role_template=None, route_key=None, is_enabled=1):
    _require_user_manager()
    template_key = _validate_template_key(role_template)
    route_value = (route_key or "").strip()
    if route_value not in SCREEN_ACCESS_ROUTE_KEYS:
        frappe.throw(_("Bilinmeyen ekran anahtari."), frappe.ValidationError)

    matrix = _read_screen_access_matrix()
    matrix[template_key][route_value] = bool(int(is_enabled))
    frappe.defaults.set_global_default(SCREEN_ACCESS_DEFAULT_KEY, json.dumps(matrix, sort_keys=True))
    frappe.db.commit()
    return {"matrix": matrix}


@frappe.whitelist()
def get_action_access_matrix():
    _require_user_manager()
    return {"matrix": _read_action_access_matrix(), "actions": ACTION_KEYS}


@frappe.whitelist()
def save_action_access_rule(role_template=None, action_key=None, is_enabled=1):
    _require_user_manager()
    template_key = _validate_template_key(role_template)
    action_value = (action_key or "").strip()
    if action_value not in ACTION_KEYS:
        frappe.throw(_("Bilinmeyen islem anahtari."), frappe.ValidationError)

    matrix = _read_action_access_matrix()
    matrix[template_key][action_value] = bool(int(is_enabled))
    frappe.defaults.set_global_default(ACTION_ACCESS_DEFAULT_KEY, json.dumps(matrix, sort_keys=True))
    frappe.db.commit()
    return {"matrix": matrix}


@frappe.whitelist()
def get_action_limit_matrix():
    _require_user_manager()
    return {"limits": _read_action_limits(), "actions": ACTION_KEYS}


@frappe.whitelist()
def save_action_limit_rule(action_key=None, limit_value=None):
    _require_user_manager()
    action_value = (action_key or "").strip()
    if action_value not in ACTION_KEYS:
        frappe.throw(_("Bilinmeyen islem anahtari."), frappe.ValidationError)

    if limit_value in (None, ""):
        normalized = None
    else:
        try:
            normalized = float(limit_value)
        except (TypeError, ValueError):
            frappe.throw(_("Tutar limiti numerik olmalidir."), frappe.ValidationError)
        if normalized < 0:
            frappe.throw(_("Tutar limiti sifirdan kucuk olamaz."), frappe.ValidationError)

    limits = _read_action_limits()
    limits[action_value] = normalized
    frappe.defaults.set_global_default(ACTION_LIMITS_DEFAULT_KEY, json.dumps(limits, sort_keys=True))
    frappe.db.commit()
    return {"limits": limits}
