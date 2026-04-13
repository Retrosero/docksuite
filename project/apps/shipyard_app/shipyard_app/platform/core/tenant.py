import frappe


def get_tenant_context(tenant_site=None):
    site_name = (tenant_site or getattr(frappe.local, "site", "") or "").strip()
    if not site_name:
        frappe.throw("tenant_site zorunludur.")
    return {"tenant_site": site_name}

