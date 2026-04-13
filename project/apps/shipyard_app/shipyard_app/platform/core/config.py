import json
from pathlib import Path

import frappe


PLATFORM_CONFIG_FILE = "config/platform_domains.json"


def _config_file_path():
    return Path(__file__).resolve().parents[2] / PLATFORM_CONFIG_FILE


def _read_file_config():
    try:
        raw = _config_file_path().read_text(encoding="utf-8")
        data = json.loads(raw)
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    return {}


def _normalize_domains(raw_domains):
    if not isinstance(raw_domains, dict):
        return {}

    normalized = {}
    for domain_key, domain_cfg in raw_domains.items():
        key = (domain_key or "").strip().lower()
        if not key or not isinstance(domain_cfg, dict):
            continue
        normalized[key] = {
            "key": key,
            "display_name": (domain_cfg.get("display_name") or key.title()).strip(),
            "module_path": (
                domain_cfg.get("module_path")
                or f"shipyard_app.platform.domains.{key}"
            ).strip(),
            "is_enabled": 1 if bool(domain_cfg.get("is_enabled", 1)) else 0,
            "required_features": [
                str(row).strip()
                for row in (domain_cfg.get("required_features") or [])
                if str(row).strip()
            ],
        }
    return normalized


def resolve_platform_config():
    file_config = _read_file_config()
    hook_config = frappe.get_hooks("shipyard_platform")
    hook_config = hook_config[0] if isinstance(hook_config, list) and hook_config else hook_config
    site_config = getattr(frappe, "conf", {}).get("shipyard_platform", {})

    merged = {}
    for source in (file_config, hook_config, site_config):
        if isinstance(source, dict):
            merged.update(source)

    core_services = merged.get("core_services") or ["auth", "tenant", "logging", "config"]
    core_services = [str(item).strip() for item in core_services if str(item).strip()]
    domains = _normalize_domains(merged.get("domains"))
    if not domains:
        frappe.throw(f"Platform domain config bos: {PLATFORM_CONFIG_FILE}")

    default_domain = (merged.get("default_domain") or "").strip().lower()
    if not default_domain or default_domain not in domains:
        default_domain = next(iter(domains.keys()))

    return {
        "core_services": core_services,
        "default_domain": default_domain,
        "domains": domains,
    }

