import frappe

from shipyard_app.platform import registry
from shipyard_app.platform.core import config, logging


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

