import frappe
from frappe import _

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

SCREEN_ACCESS_MAP = {
    "sales": ["yonetici", "muhasebe_sorumlusu", "satis_operasyon", "salt_okuma"],
    "tahsilat": ["yonetici", "muhasebe_sorumlusu", "satis_operasyon", "salt_okuma"],
    "alis": ["yonetici", "muhasebe_sorumlusu", "salt_okuma"],
    "gider": ["yonetici", "muhasebe_sorumlusu", "salt_okuma"],
    "kasa_banka": ["yonetici", "muhasebe_sorumlusu"],
    "raporlar": ["yonetici", "muhasebe_sorumlusu", "salt_okuma"],
    "kullanicilar": ["yonetici", "muhasebe_sorumlusu"],
    "gun_sonu": ["yonetici", "muhasebe_sorumlusu"],
    "ayarlar": ["yonetici", "muhasebe_sorumlusu"],
}

ACTION_ACCESS_MAP = {
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

AMOUNT_LIMITS = {
    "submit_sales_invoice": 50000,
    "submit_payment_entry": 50000,
    "create_transfer": 25000,
    "submit_expense": 25000,
}


def _require_authenticated_user():
    if frappe.session.user == "Guest":
        frappe.throw(_("Bu işlem için oturum açmalısınız."), frappe.PermissionError)


def _is_system_manager():
    user_roles = set(frappe.get_roles(frappe.session.user) or [])
    return "System Manager" in user_roles or "Accounts Manager" in user_roles


def get_user_role_template() -> str | None:
    role_template = frappe.db.get_value(
        "User",
        frappe.session.user,
        "user_defaults",
    )
    return role_template


def has_screen_access(screen_key: str) -> bool:
    _require_authenticated_user()
    
    if _is_system_manager():
        return True
    
    template = get_user_role_template()
    if not template:
        return False
    
    allowed_templates = SCREEN_ACCESS_MAP.get(screen_key, [])
    return template in allowed_templates


def has_action_permission(action_key: str) -> bool:
    _require_authenticated_user()
    
    if _is_system_manager():
        return True
    
    template = get_user_role_template()
    if not template:
        return False
    
    allowed_templates = ACTION_ACCESS_MAP.get(action_key, [])
    return template in allowed_templates


def check_screen_access_or_403(screen_key: str) -> None:
    if not has_screen_access(screen_key):
        frappe.throw(
            _("Bu ekrana erişim yetkiniz yok."),
            frappe.PermissionError
        )


def check_action_permission_or_403(action_key: str) -> None:
    if not has_action_permission(action_key):
        frappe.throw(
            _("Bu işlemi yapma yetkiniz yok."),
            frappe.PermissionError
        )


def get_amount_limit(action_key: str) -> float | None:
    return AMOUNT_LIMITS.get(action_key)


def check_amount_limit_or_403(action_key: str, amount: float) -> None:
    limit = get_amount_limit(action_key)
    if limit and amount > limit:
        frappe.throw(
            _("Bu işlem için yetkiniz yok. Tutar sınırı: {0} TL").format(limit),
            frappe.PermissionError
        )


def validate_transaction(action_key: str, amount: float | None = None) -> None:
    check_action_permission_or_403(action_key)
    if amount is not None:
        check_amount_limit_or_403(action_key, amount)
