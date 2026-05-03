import json

import frappe
from frappe import _


FEATURE_SETTINGS_DEFAULT_KEY = "pre_accounting_feature_settings"

DEFAULT_FEATURE_SETTINGS = {
    "dashboard.show_overdue_receivables": True,
    "sales_invoice.show_discount_button": False,
    "purchase_invoice.show_supplier_filter": True,
    "customer.show_balance_panel": True,
    "product.show_stock_badges": True,
    "stock.show_low_stock_alert": True,
    "end_of_day.show_cash_difference": True,
    "mobile.enable_quick_collection": False,
}


def _read_feature_settings():
    raw = frappe.defaults.get_global_default(FEATURE_SETTINGS_DEFAULT_KEY)
    if not raw:
        return DEFAULT_FEATURE_SETTINGS.copy()

    try:
        parsed = json.loads(raw)
    except (TypeError, ValueError):
        return DEFAULT_FEATURE_SETTINGS.copy()

    if not isinstance(parsed, dict):
        return DEFAULT_FEATURE_SETTINGS.copy()

    settings = DEFAULT_FEATURE_SETTINGS.copy()
    for key in DEFAULT_FEATURE_SETTINGS:
        if key in parsed:
            settings[key] = bool(parsed[key])
    return settings


def _coerce_boolean(value):
    if isinstance(value, bool):
        return value

    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"1", "true", "yes", "on"}:
            return True
        if normalized in {"0", "false", "no", "off"}:
            return False

    if isinstance(value, int) and value in {0, 1}:
        return bool(value)

    frappe.throw(_("Ayar degeri true veya false olmalidir."), frappe.ValidationError)


def _require_authenticated_user():
    if frappe.session.user == "Guest":
        frappe.throw(_("Ayar degistirmek icin oturum acmalisiniz."), frappe.PermissionError)


@frappe.whitelist()
def get_feature_settings():
    return {"settings": _read_feature_settings()}


@frappe.whitelist()
def save_feature_setting(key, value):
    _require_authenticated_user()

    key = (key or "").strip()
    if key not in DEFAULT_FEATURE_SETTINGS:
        frappe.throw(_("Bilinmeyen ayar anahtari."), frappe.ValidationError)

    settings = _read_feature_settings()
    settings[key] = _coerce_boolean(value)

    frappe.defaults.set_global_default(
        FEATURE_SETTINGS_DEFAULT_KEY,
        json.dumps(settings, sort_keys=True),
    )
    frappe.db.commit()

    return {"settings": settings}
