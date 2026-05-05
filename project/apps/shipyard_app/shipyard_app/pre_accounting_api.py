import json

import frappe
from frappe import _

from shipyard_app import productization


FEATURE_SETTINGS_DEFAULT_KEY = "pre_accounting_feature_settings"
DEFAULT_TENANT_PLAN = "temel"
PLAN_CODE_MAP = {
    "basic": "temel",
    "pro": "ticari",
    "enterprise": "mobil",
}

DEFAULT_FEATURE_SETTINGS = {
    "dashboard.show_overdue_receivables": True,
    "sales_invoice.show_quotation_flow": True,
    "sales_invoice.show_quotation_conversion_readiness": True,
    "sales_invoice.show_e_document_readiness": True,
    "sales_invoice.show_return_readiness": True,
    "sales_invoice.show_discount_button": False,
    "purchase_invoice.show_supplier_filter": True,
    "customer.allow_quick_create": True,
    "customer.show_balance_panel": True,
    "supplier.allow_quick_create": True,
    "product.allow_quick_create": True,
    "product.show_stock_badges": True,
    "stock.show_low_stock_alert": True,
    "end_of_day.show_cash_difference": True,
    "cash_bank.show_internal_transfer_panel": True,
    "cash_bank.show_recent_transfer_list": True,
    "mobile.enable_quick_collection": False,
}

FEATURE_SETTING_ENABLED_PLANS = {
    "dashboard.show_overdue_receivables": {"temel", "ticari", "mobil"},
    "sales_invoice.show_quotation_flow": {"ticari", "mobil"},
    "sales_invoice.show_quotation_conversion_readiness": {"ticari", "mobil"},
    "sales_invoice.show_e_document_readiness": {"ticari", "mobil"},
    "sales_invoice.show_return_readiness": {"ticari", "mobil"},
    "sales_invoice.show_discount_button": {"ticari", "mobil"},
    "purchase_invoice.show_supplier_filter": {"temel", "ticari", "mobil"},
    "customer.allow_quick_create": {"temel", "ticari", "mobil"},
    "customer.show_balance_panel": {"temel", "ticari", "mobil"},
    "supplier.allow_quick_create": {"temel", "ticari", "mobil"},
    "product.allow_quick_create": {"temel", "ticari", "mobil"},
    "product.show_stock_badges": {"temel", "ticari", "mobil"},
    "stock.show_low_stock_alert": {"ticari", "mobil"},
    "end_of_day.show_cash_difference": {"ticari", "mobil"},
    "cash_bank.show_internal_transfer_panel": {"ticari", "mobil"},
    "cash_bank.show_recent_transfer_list": {"ticari", "mobil"},
    "mobile.enable_quick_collection": {"mobil"},
}


def _map_product_plan(plan_code):
    return PLAN_CODE_MAP.get((plan_code or "").strip().lower(), DEFAULT_TENANT_PLAN)


def _resolve_product_profile():
    try:
        return productization._resolve_feature_map()
    except Exception:
        return {}


def _resolve_tenant_plan():
    profile = _resolve_product_profile()
    return _map_product_plan(profile.get("plan_code"))


def _validate_setting_plan_access(key, value):
    if not value:
        return

    tenant_plan = _resolve_tenant_plan()
    enabled_plans = FEATURE_SETTING_ENABLED_PLANS.get(key, set())
    if tenant_plan not in enabled_plans:
        frappe.throw(_("Bu ayar mevcut tenant plani tarafindan desteklenmiyor."), frappe.PermissionError)


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


def _enforce_plan_on_settings(settings):
    plan = _resolve_tenant_plan()
    constrained = settings.copy()
    for key, enabled in settings.items():
        if not enabled:
            continue
        if plan not in FEATURE_SETTING_ENABLED_PLANS.get(key, set()):
            constrained[key] = False
    return constrained


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
    return {
        "settings": _enforce_plan_on_settings(_read_feature_settings()),
        "plan": _resolve_tenant_plan(),
    }


@frappe.whitelist()
def get_tenant_config():
    profile = _resolve_product_profile()
    return {
        "config": {
            "siteName": frappe.local.site,
            "appTitle": "On Muhasebe Portal",
            "plan": _map_product_plan(profile.get("plan_code")),
            "locale": "tr",
            "currency": "TRY",
            "timezone": "Europe/Istanbul",
        },
        "productProfile": {
            "plan_code": profile.get("plan_code"),
            "plan_name": profile.get("plan_name"),
            "enabled_features": profile.get("enabled_features") or [],
            "module_toggles": profile.get("module_toggles") or {},
        },
    }


@frappe.whitelist()
def normalize_feature_settings_for_plan():
    frappe.only_for("System Manager")

    raw_settings = _read_feature_settings()
    normalized_settings = _enforce_plan_on_settings(raw_settings)
    changed_keys = [
        key for key in sorted(raw_settings.keys()) if bool(raw_settings.get(key)) != bool(normalized_settings.get(key))
    ]

    if changed_keys:
        frappe.defaults.set_global_default(
            FEATURE_SETTINGS_DEFAULT_KEY,
            json.dumps(normalized_settings, sort_keys=True),
        )
        frappe.db.commit()

    return {
        "ok": True,
        "plan": _resolve_tenant_plan(),
        "changed_keys": changed_keys,
        "settings": normalized_settings,
    }


@frappe.whitelist()
def save_feature_setting(key, value):
    _require_authenticated_user()

    key = (key or "").strip()
    if key not in DEFAULT_FEATURE_SETTINGS:
        frappe.throw(_("Bilinmeyen ayar anahtari."), frappe.ValidationError)

    next_value = _coerce_boolean(value)
    _validate_setting_plan_access(key, next_value)

    settings = _enforce_plan_on_settings(_read_feature_settings())
    settings[key] = next_value

    frappe.defaults.set_global_default(
        FEATURE_SETTINGS_DEFAULT_KEY,
        json.dumps(settings, sort_keys=True),
    )
    frappe.db.commit()

    return {"settings": settings}
