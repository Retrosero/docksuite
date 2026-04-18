import json
import re

import frappe

from shipyard_app.platform import registry
from shipyard_app.platform.core import auth, config, logging


TENANT_SETTINGS_DOCTYPE = "Tenant Settings"
TENANT_LEAVE_TYPE_FIELD = "shipyard_leave_types"


def bootstrap_platform_layer():
    resolved = config.resolve_platform_config()
    domains = []
    for domain_key in resolved["domains"]:
        domains.append(registry.resolve_domain_context(domain_key))
    logging.write_platform_log(
        "Platform layer bootstrap tamamlandi.",
        details={
            "default_domain": resolved["default_domain"],
            "domains": list(resolved["domains"].keys()),
        },
    )
    return {
        "ok": True,
        "default_domain": resolved["default_domain"],
        "core_services": resolved["core_services"],
        "domains": [row["domain"] for row in domains],
    }


@frappe.whitelist()
def get_platform_context(tenant_site=None):
    frappe.only_for("System Manager")
    return registry.resolve_platform_context(tenant_site=tenant_site)


@frappe.whitelist()
def get_domain_context(domain_key, tenant_site=None):
    frappe.only_for("System Manager")
    return registry.resolve_domain_context(domain_key, tenant_site=tenant_site)


@frappe.whitelist()
def is_domain_capability_enabled(domain_key, capability_key, tenant_site=None):
    context = registry.resolve_domain_context(domain_key, tenant_site=tenant_site)
    capability = (context.get("capabilities") or {}).get((capability_key or "").strip().lower())
    return {"enabled": bool(capability and capability.get("enabled")), "context": context}


@frappe.whitelist()
def get_session_actor_context():
    auth_context = auth.get_auth_context()
    role_set = set(auth_context.get("roles") or [])
    foreman_roles = {"Shipyard Foreman", "Shipyard Manager", "System Manager"}
    can_view_foreman = bool(role_set.intersection(foreman_roles))

    return {
        "user": auth_context.get("user"),
        "roles": sorted(role_set),
        "attendance_view": {
            "can_view_worker": True,
            "can_view_foreman": can_view_foreman,
            "default_mode": "foreman" if can_view_foreman else "worker",
        },
    }


def _normalize_leave_type_names(value):
    if value is None:
        return []

    items = []

    if isinstance(value, str):
        text = value.strip()
        if not text:
            return []

        if text.startswith("["):
            try:
                parsed = json.loads(text)
                if isinstance(parsed, list):
                    items = [str(item).strip() for item in parsed]
                else:
                    items = [text]
            except Exception:
                items = re.split(r"[\n,]+", text)
        else:
            items = re.split(r"[\n,]+", text)
    elif isinstance(value, (list, tuple, set)):
        items = [str(item).strip() for item in value]
    else:
        items = [str(value).strip()]

    seen = set()
    normalized = []
    for item in items:
        candidate = str(item).strip()
        if not candidate or candidate in seen:
            continue
        seen.add(candidate)
        normalized.append(candidate)

    return normalized


def _ensure_leave_type_master(leave_type_name):
    if frappe.db.exists("Leave Type", leave_type_name):
        return {"name": leave_type_name, "created": False}

    payload = {
        "doctype": "Leave Type",
        "name": leave_type_name,
        "leave_type_name": leave_type_name,
    }
    meta = frappe.get_meta("Leave Type")
    if meta.get_field("allow_encashment"):
        payload["allow_encashment"] = 0
    if meta.get_field("is_carry_forward"):
        payload["is_carry_forward"] = 0
    if meta.get_field("max_continuous_days_allowed"):
        payload["max_continuous_days_allowed"] = 0
    if meta.get_field("include_holiday"):
        payload["include_holiday"] = 1

    doc = frappe.get_doc(payload)
    doc.insert(ignore_permissions=True)
    return {"name": doc.name, "created": True}


def _ensure_tenant_leave_type_field():
    if not frappe.db.exists("DocType", TENANT_SETTINGS_DOCTYPE):
        frappe.throw("Tenant Settings DocType bulunamadi.")

    meta = frappe.get_meta(TENANT_SETTINGS_DOCTYPE)
    if meta.get_field(TENANT_LEAVE_TYPE_FIELD):
        return True

    custom_field_name = f"{TENANT_SETTINGS_DOCTYPE}-{TENANT_LEAVE_TYPE_FIELD}"
    if frappe.db.exists("Custom Field", custom_field_name):
        return True

    frappe.get_doc(
        {
            "doctype": "Custom Field",
            "dt": TENANT_SETTINGS_DOCTYPE,
            "fieldname": TENANT_LEAVE_TYPE_FIELD,
            "fieldtype": "Small Text",
            "label": "Izin Turleri",
            "description": "Her satira bir ERPNext Leave Type adi yazin.",
            "insert_after": "create_demo_data",
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return True


@frappe.whitelist()
def get_leave_type_settings():
    raw_value = ""
    if frappe.db.exists("DocType", TENANT_SETTINGS_DOCTYPE):
        _ensure_tenant_leave_type_field()
        raw_value = frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_LEAVE_TYPE_FIELD) or ""

    leave_types = _normalize_leave_type_names(raw_value)
    return {
        "leave_types_text": "\n".join(leave_types),
        "leave_types": leave_types,
    }


@frappe.whitelist()
def save_leave_type_settings(leave_types_text=None):
    frappe.only_for("System Manager")

    _ensure_tenant_leave_type_field()

    leave_types = _normalize_leave_type_names(leave_types_text or "")
    joined_value = "\n".join(leave_types)
    frappe.db.set_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_LEAVE_TYPE_FIELD, joined_value)

    synced = []
    for leave_type_name in leave_types:
        synced.append(_ensure_leave_type_master(leave_type_name))

    frappe.db.commit()
    return {
        "leave_types_text": joined_value,
        "leave_types": leave_types,
        "synced": synced,
    }

