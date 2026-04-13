import json

import frappe
from frappe.utils import now_datetime


PRODUCT_PLAN_DOCTYPE = "Product Plan"
TENANT_PRODUCT_CONFIG_DOCTYPE = "Tenant Product Config"
TENANT_FEATURE_ACCESS_DOCTYPE = "Tenant Feature Access"
TENANT_USAGE_COUNTER_DOCTYPE = "Tenant Usage Counter"

DEFAULT_PLAN_CATALOG = [
    {
        "plan_code": "basic",
        "plan_name": "Basic",
        "max_users": 25,
        "max_transactions_per_month": 10000,
        "hr_module_enabled": 1,
        "stock_module_enabled": 0,
        "default_feature_flags_json": json.dumps(
            ["module.hr", "tasks", "teams", "attendance"], ensure_ascii=False
        ),
        "priority": 10,
    },
    {
        "plan_code": "pro",
        "plan_name": "Pro",
        "max_users": 150,
        "max_transactions_per_month": 100000,
        "hr_module_enabled": 1,
        "stock_module_enabled": 1,
        "default_feature_flags_json": json.dumps(
            [
                "module.hr",
                "module.stock",
                "tasks",
                "teams",
                "attendance",
                "material_request",
                "zimmet",
                "field_report",
                "technical_document",
            ],
            ensure_ascii=False,
        ),
        "priority": 20,
    },
    {
        "plan_code": "enterprise",
        "plan_name": "Enterprise",
        "max_users": 0,
        "max_transactions_per_month": 0,
        "hr_module_enabled": 1,
        "stock_module_enabled": 1,
        "default_feature_flags_json": json.dumps(
            [
                "module.hr",
                "module.stock",
                "tasks",
                "teams",
                "attendance",
                "material_request",
                "zimmet",
                "field_report",
                "technical_document",
                "operations_support",
                "advanced_reporting",
            ],
            ensure_ascii=False,
        ),
        "priority": 30,
    },
]


def _tenant_site():
    return getattr(frappe.local, "site", "") or ""


def _to_bool(value, default=False):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, int):
        return value != 0
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _parse_json_list(raw_value):
    if not raw_value:
        return []
    if isinstance(raw_value, list):
        return [str(item).strip() for item in raw_value if str(item).strip()]
    try:
        parsed = json.loads(raw_value)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except Exception:
        pass
    return []


def _create_custom_doctype(
    doctype_name,
    fields,
    title_field,
    search_fields,
    *,
    autoname="hash",
    naming_rule="Random",
):
    if frappe.db.exists("DocType", doctype_name):
        return {"created": False, "name": doctype_name}

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": doctype_name,
            "module": "Shipyard App",
            "custom": 1,
            "autoname": autoname,
            "naming_rule": naming_rule,
            "title_field": title_field,
            "search_fields": search_fields,
            "track_changes": 1,
            "fields": fields,
            "permissions": [
                {
                    "role": "System Manager",
                    "read": 1,
                    "write": 1,
                    "create": 1,
                    "delete": 1,
                    "share": 1,
                    "print": 1,
                    "email": 1,
                    "report": 1,
                    "export": 1,
                }
            ],
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": doc.name}


def ensure_product_plan_doctype():
    return _create_custom_doctype(
        PRODUCT_PLAN_DOCTYPE,
        [
            {
                "fieldname": "plan_code",
                "label": "Plan Kodu",
                "fieldtype": "Data",
                "reqd": 1,
                "unique": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "plan_name",
                "label": "Plan Adi",
                "fieldtype": "Data",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "is_active",
                "label": "Aktif",
                "fieldtype": "Check",
                "default": "1",
                "in_list_view": 1,
            },
            {
                "fieldname": "max_users",
                "label": "Maksimum Kullanici",
                "fieldtype": "Int",
                "default": "0",
            },
            {
                "fieldname": "max_transactions_per_month",
                "label": "Aylik Islem Limiti",
                "fieldtype": "Int",
                "default": "0",
            },
            {
                "fieldname": "hr_module_enabled",
                "label": "HR Modulu Acik",
                "fieldtype": "Check",
                "default": "1",
                "in_list_view": 1,
            },
            {
                "fieldname": "stock_module_enabled",
                "label": "Stok Modulu Acik",
                "fieldtype": "Check",
                "default": "0",
                "in_list_view": 1,
            },
            {
                "fieldname": "default_feature_flags_json",
                "label": "Varsayilan Feature Flags (JSON)",
                "fieldtype": "Long Text",
            },
            {
                "fieldname": "priority",
                "label": "Oncelik",
                "fieldtype": "Int",
                "default": "10",
            },
            {
                "fieldname": "note",
                "label": "Not",
                "fieldtype": "Small Text",
            },
        ],
        title_field="plan_name",
        search_fields="plan_code,plan_name",
        autoname="field:plan_code",
        naming_rule="By fieldname",
    )


def ensure_tenant_product_config_doctype():
    return _create_custom_doctype(
        TENANT_PRODUCT_CONFIG_DOCTYPE,
        [
            {
                "fieldname": "tenant_site",
                "label": "Tenant Site",
                "fieldtype": "Data",
                "reqd": 1,
                "unique": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "plan_code",
                "label": "Plan",
                "fieldtype": "Link",
                "options": PRODUCT_PLAN_DOCTYPE,
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "is_active",
                "label": "Aktif",
                "fieldtype": "Check",
                "default": "1",
            },
            {
                "fieldname": "use_plan_module_defaults",
                "label": "Modul Ayarlarini Plandan Al",
                "fieldtype": "Check",
                "default": "1",
            },
            {
                "fieldname": "hr_module_enabled_override",
                "label": "HR Modulu Override",
                "fieldtype": "Check",
                "default": "1",
            },
            {
                "fieldname": "stock_module_enabled_override",
                "label": "Stok Modulu Override",
                "fieldtype": "Check",
                "default": "0",
            },
            {
                "fieldname": "use_plan_feature_defaults",
                "label": "Feature Ayarlarini Plandan Al",
                "fieldtype": "Check",
                "default": "1",
            },
            {
                "fieldname": "extra_enabled_features_json",
                "label": "Ek Acik Featurelar (JSON)",
                "fieldtype": "Long Text",
            },
            {
                "fieldname": "extra_disabled_features_json",
                "label": "Ek Kapali Featurelar (JSON)",
                "fieldtype": "Long Text",
            },
            {
                "fieldname": "enforce_usage_limits",
                "label": "Kullanim Limitlerini Uygula",
                "fieldtype": "Check",
                "default": "1",
            },
            {
                "fieldname": "note",
                "label": "Not",
                "fieldtype": "Small Text",
            },
        ],
        title_field="tenant_site",
        search_fields="tenant_site,plan_code",
        autoname="field:tenant_site",
        naming_rule="By fieldname",
    )


def ensure_tenant_feature_access_doctype():
    return _create_custom_doctype(
        TENANT_FEATURE_ACCESS_DOCTYPE,
        [
            {
                "fieldname": "access_key",
                "label": "Erisim Anahtari",
                "fieldtype": "Data",
                "reqd": 1,
                "unique": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "tenant_site",
                "label": "Tenant Site",
                "fieldtype": "Data",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "feature_key",
                "label": "Feature Anahtari",
                "fieldtype": "Data",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "is_enabled",
                "label": "Acik",
                "fieldtype": "Check",
                "default": "1",
                "in_list_view": 1,
            },
            {
                "fieldname": "source",
                "label": "Kaynak",
                "fieldtype": "Select",
                "options": "plan\nmanual\napi",
                "default": "manual",
                "in_list_view": 1,
            },
            {
                "fieldname": "note",
                "label": "Not",
                "fieldtype": "Small Text",
            },
        ],
        title_field="feature_key",
        search_fields="tenant_site,feature_key,source",
        autoname="field:access_key",
        naming_rule="By fieldname",
    )


def ensure_tenant_usage_counter_doctype():
    return _create_custom_doctype(
        TENANT_USAGE_COUNTER_DOCTYPE,
        [
            {
                "fieldname": "usage_key",
                "label": "Kullanim Anahtari",
                "fieldtype": "Data",
                "reqd": 1,
                "unique": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "tenant_site",
                "label": "Tenant Site",
                "fieldtype": "Data",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "period_key",
                "label": "Donem",
                "fieldtype": "Data",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "active_user_count",
                "label": "Aktif Kullanici Sayisi",
                "fieldtype": "Int",
                "default": "0",
                "in_list_view": 1,
            },
            {
                "fieldname": "transaction_count",
                "label": "Islem Sayisi",
                "fieldtype": "Int",
                "default": "0",
                "in_list_view": 1,
            },
            {
                "fieldname": "event_breakdown_json",
                "label": "Islem Dagilimi (JSON)",
                "fieldtype": "Long Text",
            },
            {
                "fieldname": "last_event_at",
                "label": "Son Olay Zamani",
                "fieldtype": "Datetime",
            },
            {
                "fieldname": "note",
                "label": "Not",
                "fieldtype": "Small Text",
            },
        ],
        title_field="usage_key",
        search_fields="tenant_site,period_key",
        autoname="field:usage_key",
        naming_rule="By fieldname",
    )


def ensure_default_plan_catalog():
    ensure_product_plan_doctype()
    created = []
    updated = []

    for plan in DEFAULT_PLAN_CATALOG:
        existing = frappe.db.exists(PRODUCT_PLAN_DOCTYPE, plan["plan_code"])
        if existing:
            doc = frappe.get_doc(PRODUCT_PLAN_DOCTYPE, plan["plan_code"])
            changed = False
            for fieldname, value in plan.items():
                if getattr(doc, fieldname, None) != value:
                    setattr(doc, fieldname, value)
                    changed = True
            if changed:
                doc.save(ignore_permissions=True)
                updated.append(plan["plan_code"])
            continue

        frappe.get_doc({"doctype": PRODUCT_PLAN_DOCTYPE, **plan}).insert(
            ignore_permissions=True
        )
        created.append(plan["plan_code"])

    if created or updated:
        frappe.db.commit()
    return {"created": created, "updated": updated}


def ensure_tenant_product_config(tenant_site=None, plan_code="basic"):
    ensure_tenant_product_config_doctype()
    tenant_site = (tenant_site or _tenant_site()).strip()
    if not tenant_site:
        frappe.throw("tenant_site zorunludur.")

    if not frappe.db.exists(PRODUCT_PLAN_DOCTYPE, plan_code):
        frappe.throw(f"Plan bulunamadi: {plan_code}")

    existing = frappe.db.exists(TENANT_PRODUCT_CONFIG_DOCTYPE, tenant_site)
    if existing:
        return {"created": False, "name": tenant_site}

    doc = frappe.get_doc(
        {
            "doctype": TENANT_PRODUCT_CONFIG_DOCTYPE,
            "tenant_site": tenant_site,
            "plan_code": plan_code,
            "is_active": 1,
            "use_plan_module_defaults": 1,
            "hr_module_enabled_override": 1,
            "stock_module_enabled_override": 0,
            "use_plan_feature_defaults": 1,
            "enforce_usage_limits": 1,
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": doc.name}


def _get_plan_doc(plan_code):
    if not plan_code:
        return None
    if not frappe.db.exists(PRODUCT_PLAN_DOCTYPE, plan_code):
        return None
    return frappe.get_doc(PRODUCT_PLAN_DOCTYPE, plan_code)


def _resolve_tenant_config(tenant_site=None):
    tenant_site = (tenant_site or _tenant_site()).strip()
    if not tenant_site:
        frappe.throw("tenant_site zorunludur.")

    ensure_default_plan_catalog()
    config_result = ensure_tenant_product_config(tenant_site=tenant_site, plan_code="basic")
    _ = config_result
    config_doc = frappe.get_doc(TENANT_PRODUCT_CONFIG_DOCTYPE, tenant_site)
    plan_doc = _get_plan_doc(config_doc.plan_code) or _get_plan_doc("basic")
    return tenant_site, config_doc, plan_doc


def _resolve_feature_map(tenant_site=None):
    tenant_site, config_doc, plan_doc = _resolve_tenant_config(tenant_site=tenant_site)

    plan_flags = _parse_json_list(getattr(plan_doc, "default_feature_flags_json", ""))
    enabled = set(plan_flags if _to_bool(config_doc.use_plan_feature_defaults, default=True) else [])
    enabled.update(_parse_json_list(config_doc.extra_enabled_features_json))
    enabled.difference_update(_parse_json_list(config_doc.extra_disabled_features_json))

    access_rows = frappe.get_all(
        TENANT_FEATURE_ACCESS_DOCTYPE,
        filters={"tenant_site": tenant_site},
        fields=["feature_key", "is_enabled"],
        limit_page_length=1000,
    )
    for row in access_rows:
        key = (row.get("feature_key") or "").strip()
        if not key:
            continue
        if _to_bool(row.get("is_enabled"), default=False):
            enabled.add(key)
        else:
            enabled.discard(key)

    module_hr = _to_bool(
        plan_doc.hr_module_enabled if _to_bool(config_doc.use_plan_module_defaults, default=True)
        else config_doc.hr_module_enabled_override,
        default=False,
    )
    module_stock = _to_bool(
        plan_doc.stock_module_enabled if _to_bool(config_doc.use_plan_module_defaults, default=True)
        else config_doc.stock_module_enabled_override,
        default=False,
    )

    if module_hr:
        enabled.add("module.hr")
    else:
        enabled.discard("module.hr")

    if module_stock:
        enabled.add("module.stock")
    else:
        enabled.discard("module.stock")

    return {
        "tenant_site": tenant_site,
        "plan_code": plan_doc.plan_code,
        "plan_name": plan_doc.plan_name,
        "max_users": int(plan_doc.max_users or 0),
        "max_transactions_per_month": int(plan_doc.max_transactions_per_month or 0),
        "module_toggles": {"hr": module_hr, "stock": module_stock},
        "enabled_features": sorted(enabled),
        "enforce_usage_limits": _to_bool(config_doc.enforce_usage_limits, default=True),
    }


def _current_period_key():
    return now_datetime().strftime("%Y-%m")


def _usage_key(tenant_site, period_key):
    return f"{tenant_site}:{period_key}"


def _upsert_usage_counter(tenant_site, period_key=None):
    ensure_tenant_usage_counter_doctype()
    period_key = period_key or _current_period_key()
    usage_key = _usage_key(tenant_site, period_key)

    if frappe.db.exists(TENANT_USAGE_COUNTER_DOCTYPE, usage_key):
        return frappe.get_doc(TENANT_USAGE_COUNTER_DOCTYPE, usage_key)

    doc = frappe.get_doc(
        {
            "doctype": TENANT_USAGE_COUNTER_DOCTYPE,
            "usage_key": usage_key,
            "tenant_site": tenant_site,
            "period_key": period_key,
            "active_user_count": 0,
            "transaction_count": 0,
            "event_breakdown_json": "{}",
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return doc


def bootstrap_productization():
    setup = {
        "product_plan": ensure_product_plan_doctype(),
        "tenant_product_config": ensure_tenant_product_config_doctype(),
        "tenant_feature_access": ensure_tenant_feature_access_doctype(),
        "tenant_usage_counter": ensure_tenant_usage_counter_doctype(),
        "default_plan_catalog": ensure_default_plan_catalog(),
    }
    setup["tenant_config"] = ensure_tenant_product_config()
    return setup


@frappe.whitelist()
def set_tenant_plan(plan_code, tenant_site=None):
    frappe.only_for("System Manager")
    tenant_site = (tenant_site or _tenant_site()).strip()
    if not tenant_site:
        frappe.throw("tenant_site zorunludur.")
    if not frappe.db.exists(PRODUCT_PLAN_DOCTYPE, plan_code):
        frappe.throw(f"Plan bulunamadi: {plan_code}")

    ensure_tenant_product_config(tenant_site=tenant_site, plan_code=plan_code)
    doc = frappe.get_doc(TENANT_PRODUCT_CONFIG_DOCTYPE, tenant_site)
    doc.plan_code = plan_code
    doc.save(ignore_permissions=True)
    frappe.db.commit()

    return {"ok": True, "tenant_site": tenant_site, "plan_code": plan_code}


@frappe.whitelist()
def set_module_toggles(
    tenant_site=None,
    use_plan_module_defaults=1,
    hr_module_enabled_override=1,
    stock_module_enabled_override=0,
):
    frappe.only_for("System Manager")
    tenant_site = (tenant_site or _tenant_site()).strip()
    ensure_tenant_product_config(tenant_site=tenant_site)
    doc = frappe.get_doc(TENANT_PRODUCT_CONFIG_DOCTYPE, tenant_site)
    doc.use_plan_module_defaults = 1 if _to_bool(use_plan_module_defaults, default=True) else 0
    doc.hr_module_enabled_override = 1 if _to_bool(hr_module_enabled_override, default=True) else 0
    doc.stock_module_enabled_override = 1 if _to_bool(stock_module_enabled_override, default=False) else 0
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    return {"ok": True, "tenant_site": tenant_site}


@frappe.whitelist()
def upsert_feature_access(
    feature_key,
    is_enabled=1,
    tenant_site=None,
    source="api",
    note=None,
):
    frappe.only_for("System Manager")
    if not feature_key:
        frappe.throw("feature_key zorunludur.")

    tenant_site = (tenant_site or _tenant_site()).strip()
    if not tenant_site:
        frappe.throw("tenant_site zorunludur.")

    ensure_tenant_feature_access_doctype()
    access_key = f"{tenant_site}:{feature_key}"

    if frappe.db.exists(TENANT_FEATURE_ACCESS_DOCTYPE, access_key):
        doc = frappe.get_doc(TENANT_FEATURE_ACCESS_DOCTYPE, access_key)
        doc.is_enabled = 1 if _to_bool(is_enabled, default=True) else 0
        doc.source = source or "api"
        if note is not None:
            doc.note = note
        doc.save(ignore_permissions=True)
        frappe.db.commit()
        return {"created": False, "name": doc.name}

    doc = frappe.get_doc(
        {
            "doctype": TENANT_FEATURE_ACCESS_DOCTYPE,
            "access_key": access_key,
            "tenant_site": tenant_site,
            "feature_key": feature_key,
            "is_enabled": 1 if _to_bool(is_enabled, default=True) else 0,
            "source": source or "api",
            "note": note,
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": doc.name}


@frappe.whitelist()
def get_tenant_product_profile(tenant_site=None):
    frappe.only_for("System Manager")
    return _resolve_feature_map(tenant_site=tenant_site)


@frappe.whitelist()
def is_feature_enabled(feature_key, tenant_site=None):
    if not feature_key:
        return {"enabled": False}
    profile = _resolve_feature_map(tenant_site=tenant_site)
    return {"enabled": feature_key in set(profile["enabled_features"]), "profile": profile}


@frappe.whitelist()
def track_usage_event(event_key="generic", amount=1, tenant_site=None, period_key=None):
    if not event_key:
        frappe.throw("event_key zorunludur.")
    tenant_site = (tenant_site or _tenant_site()).strip()
    if not tenant_site:
        frappe.throw("tenant_site zorunludur.")

    usage_doc = _upsert_usage_counter(tenant_site=tenant_site, period_key=period_key)
    amount = max(1, int(amount or 1))

    usage_doc.transaction_count = int(usage_doc.transaction_count or 0) + amount
    usage_doc.active_user_count = int(
        frappe.db.count(
            "User",
            filters={"enabled": 1, "user_type": "System User"},
        )
    )

    breakdown = {}
    try:
        breakdown = json.loads(usage_doc.event_breakdown_json or "{}")
        if not isinstance(breakdown, dict):
            breakdown = {}
    except Exception:
        breakdown = {}
    breakdown[event_key] = int(breakdown.get(event_key, 0)) + amount
    usage_doc.event_breakdown_json = json.dumps(breakdown, ensure_ascii=False)
    usage_doc.last_event_at = now_datetime().isoformat(sep=" ", timespec="seconds")
    usage_doc.save(ignore_permissions=True)
    frappe.db.commit()

    return {
        "ok": True,
        "tenant_site": tenant_site,
        "period_key": usage_doc.period_key,
        "transaction_count": usage_doc.transaction_count,
        "active_user_count": usage_doc.active_user_count,
    }


@frappe.whitelist()
def get_usage_summary(tenant_site=None, period_key=None):
    tenant_site = (tenant_site or _tenant_site()).strip()
    if not tenant_site:
        frappe.throw("tenant_site zorunludur.")

    usage_doc = _upsert_usage_counter(tenant_site=tenant_site, period_key=period_key)
    profile = _resolve_feature_map(tenant_site=tenant_site)

    limit_transactions = int(profile.get("max_transactions_per_month") or 0)
    limit_users = int(profile.get("max_users") or 0)
    transactions = int(usage_doc.transaction_count or 0)
    users = int(usage_doc.active_user_count or 0)

    return {
        "tenant_site": tenant_site,
        "period_key": usage_doc.period_key,
        "usage": {
            "active_user_count": users,
            "transaction_count": transactions,
            "event_breakdown": json.loads(usage_doc.event_breakdown_json or "{}"),
            "last_event_at": usage_doc.last_event_at,
        },
        "limits": {
            "max_users": limit_users,
            "max_transactions_per_month": limit_transactions,
            "users_limit_reached": bool(limit_users and users >= limit_users),
            "transactions_limit_reached": bool(
                limit_transactions and transactions >= limit_transactions
            ),
        },
    }
