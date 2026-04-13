from importlib import import_module

import frappe

from shipyard_app import productization
from shipyard_app.platform.core import auth, config, tenant


def _load_adapter(module_path):
    module = import_module(module_path)
    if hasattr(module, "get_domain_adapter"):
        return module.get_domain_adapter()
    if hasattr(module, "DOMAIN_ADAPTER"):
        return getattr(module, "DOMAIN_ADAPTER")
    frappe.throw(f"Domain adapter bulunamadi: {module_path}")


def _feature_profile(tenant_site=None):
    site_name = tenant.get_tenant_context(tenant_site).get("tenant_site")
    profile = productization._resolve_feature_map(tenant_site=site_name)
    return site_name, profile


def resolve_domain_context(domain_key, tenant_site=None):
    platform_cfg = config.resolve_platform_config()
    key = (domain_key or "").strip().lower()
    if key not in platform_cfg["domains"]:
        frappe.throw(f"Domain bulunamadi: {key}")

    domain_cfg = platform_cfg["domains"][key]
    adapter = _load_adapter(domain_cfg["module_path"])
    site_name, profile = _feature_profile(tenant_site=tenant_site)

    enabled_features = set(profile.get("enabled_features") or [])
    required_features = domain_cfg.get("required_features") or []
    required_ok = all(flag in enabled_features for flag in required_features)
    base_enabled = bool(domain_cfg.get("is_enabled")) and required_ok

    capability_status = adapter.build_capability_status(
        enabled_features=enabled_features,
        module_toggles=profile.get("module_toggles") or {},
    )
    active_count = len([row for row in capability_status.values() if row.get("enabled")])

    return {
        "tenant_site": site_name,
        "domain": {
            "key": key,
            "display_name": domain_cfg.get("display_name") or key.title(),
            "module_path": domain_cfg["module_path"],
            "is_enabled": bool(base_enabled and active_count > 0),
            "required_features": required_features,
        },
        "capabilities": capability_status,
        "feature_profile": {
            "plan_code": profile.get("plan_code"),
            "module_toggles": profile.get("module_toggles"),
            "enabled_features": sorted(enabled_features),
        },
    }


def list_domain_contexts(tenant_site=None):
    platform_cfg = config.resolve_platform_config()
    contexts = []
    for domain_key in platform_cfg["domains"]:
        contexts.append(resolve_domain_context(domain_key, tenant_site=tenant_site))
    return contexts


def resolve_platform_context(tenant_site=None):
    platform_cfg = config.resolve_platform_config()
    site_name = tenant.get_tenant_context(tenant_site).get("tenant_site")
    return {
        "tenant_site": site_name,
        "core": {
            "services": platform_cfg["core_services"],
            "auth": auth.get_auth_context(),
        },
        "default_domain": platform_cfg["default_domain"],
        "domains": list_domain_contexts(tenant_site=site_name),
    }

