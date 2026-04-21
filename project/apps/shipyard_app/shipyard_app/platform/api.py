import json
import re

import frappe
from frappe.utils import cint, flt, getdate

from shipyard_app.platform import registry
from shipyard_app.platform.core import auth, config, logging


TENANT_SETTINGS_DOCTYPE = "Tenant Settings"
TENANT_LEAVE_TYPE_FIELD = "shipyard_leave_types"
TENANT_DEPARTMENT_FIELD = "shipyard_departments"
TENANT_AUTO_LEAVE_ALLOCATION_FIELD = "shipyard_auto_leave_allocation"
TENANT_DEFAULT_LEAVE_ALLOCATION_DAYS_FIELD = "shipyard_default_leave_allocation_days"
TENANT_OVERTIME_DEFAULT_HOURS_FIELD = "shipyard_overtime_default_hours"
TENANT_ATTENDANCE_LOOKBACK_DAYS_FIELD = "shipyard_attendance_lookback_days"
TENANT_DASHBOARD_CRITICAL_STOCK_LIMIT_FIELD = "shipyard_dashboard_critical_stock_limit"
TENANT_PURCHASE_INVOICE_PAGE_SIZE_FIELD = "shipyard_purchase_invoice_page_size"
TENANT_STOCK_LIST_PAGE_SIZE_FIELD = "shipyard_stock_list_page_size"
TENANT_TEAM_LIST_PAGE_SIZE_FIELD = "shipyard_team_list_page_size"
TENANT_ZIMMET_LIST_PAGE_SIZE_FIELD = "shipyard_zimmet_list_page_size"
TENANT_PAYROLL_STANDARD_MONTHLY_HOURS_FIELD = "shipyard_payroll_standard_monthly_hours"
LEAVE_SETTINGS_MANAGER_ROLES = {
    "System Manager",
    "HR Manager",
    "HR User",
    "Shipyard HR",
    "Shipyard Manager",
}

OPERATIONAL_SETTINGS_DEFAULTS = {
    TENANT_OVERTIME_DEFAULT_HOURS_FIELD: 2.0,
    TENANT_ATTENDANCE_LOOKBACK_DAYS_FIELD: 30,
    TENANT_DASHBOARD_CRITICAL_STOCK_LIMIT_FIELD: 5,
    TENANT_PURCHASE_INVOICE_PAGE_SIZE_FIELD: 20,
    TENANT_STOCK_LIST_PAGE_SIZE_FIELD: 250,
    TENANT_TEAM_LIST_PAGE_SIZE_FIELD: 250,
    TENANT_ZIMMET_LIST_PAGE_SIZE_FIELD: 250,
    TENANT_PAYROLL_STANDARD_MONTHLY_HOURS_FIELD: 225.0,
}


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


def _normalize_department_names(value):
    return _normalize_leave_type_names(value)


def _resolve_department_company(preferred_company=None):
    preferred = (preferred_company or "").strip()
    if preferred:
        return preferred

    default_company = (frappe.defaults.get_global_default("company") or "").strip()
    if default_company:
        return default_company

    fallback_company = frappe.db.get_value("Company", {}, "name")
    return (fallback_company or "").strip()


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


def _ensure_department_master(department_name, company=None):
    normalized = (department_name or "").strip()
    if not normalized:
        return {"name": "", "created": False}

    existing_name = frappe.db.get_value("Department", {"department_name": normalized}, "name")
    if existing_name:
        return {"name": existing_name, "created": False}

    if frappe.db.exists("Department", normalized):
        return {"name": normalized, "created": False}

    payload = {
        "doctype": "Department",
        "department_name": normalized,
    }

    if frappe.db.has_column("Department", "company"):
        resolved_company = _resolve_department_company(company)
        if resolved_company:
            payload["company"] = resolved_company

    doc = frappe.get_doc(payload)
    doc.insert(ignore_permissions=True, ignore_mandatory=True)
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


def _ensure_tenant_department_field():
    if not frappe.db.exists("DocType", TENANT_SETTINGS_DOCTYPE):
        frappe.throw("Tenant Settings DocType bulunamadi.")

    meta = frappe.get_meta(TENANT_SETTINGS_DOCTYPE)
    if meta.get_field(TENANT_DEPARTMENT_FIELD):
        return True

    custom_field_name = f"{TENANT_SETTINGS_DOCTYPE}-{TENANT_DEPARTMENT_FIELD}"
    if frappe.db.exists("Custom Field", custom_field_name):
        return True

    frappe.get_doc(
        {
            "doctype": "Custom Field",
            "dt": TENANT_SETTINGS_DOCTYPE,
            "fieldname": TENANT_DEPARTMENT_FIELD,
            "fieldtype": "Small Text",
            "label": "Departmanlar",
            "description": "Her satira bir ERPNext Department adi yazin.",
            "insert_after": TENANT_LEAVE_TYPE_FIELD,
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return True


def _ensure_tenant_leave_settings_fields():
    if not frappe.db.exists("DocType", TENANT_SETTINGS_DOCTYPE):
        frappe.throw("Tenant Settings DocType bulunamadi.")

    _ensure_tenant_leave_type_field()
    _ensure_tenant_department_field()
    meta = frappe.get_meta(TENANT_SETTINGS_DOCTYPE)

    if not meta.get_field(TENANT_AUTO_LEAVE_ALLOCATION_FIELD):
        custom_field_name = f"{TENANT_SETTINGS_DOCTYPE}-{TENANT_AUTO_LEAVE_ALLOCATION_FIELD}"
        if not frappe.db.exists("Custom Field", custom_field_name):
            frappe.get_doc(
                {
                    "doctype": "Custom Field",
                    "dt": TENANT_SETTINGS_DOCTYPE,
                    "fieldname": TENANT_AUTO_LEAVE_ALLOCATION_FIELD,
                    "fieldtype": "Check",
                    "label": "Izin Tahsisini Otomatik Olustur",
                    "description": "Izin basvurusunda aktif tahsis yoksa otomatik Leave Allocation olusturur.",
                    "default": "0",
                    "insert_after": TENANT_DEPARTMENT_FIELD,
                }
            ).insert(ignore_permissions=True)

    if not meta.get_field(TENANT_DEFAULT_LEAVE_ALLOCATION_DAYS_FIELD):
        custom_field_name = f"{TENANT_SETTINGS_DOCTYPE}-{TENANT_DEFAULT_LEAVE_ALLOCATION_DAYS_FIELD}"
        if not frappe.db.exists("Custom Field", custom_field_name):
            frappe.get_doc(
                {
                    "doctype": "Custom Field",
                    "dt": TENANT_SETTINGS_DOCTYPE,
                    "fieldname": TENANT_DEFAULT_LEAVE_ALLOCATION_DAYS_FIELD,
                    "fieldtype": "Float",
                    "label": "Varsayilan Izin Tahsis Gunu",
                    "description": "Otomatik tahsis acikken yeni tahsis icin kullanilacak gun sayisi.",
                    "default": "14",
                    "insert_after": TENANT_AUTO_LEAVE_ALLOCATION_FIELD,
                }
            ).insert(ignore_permissions=True)

    if not meta.get_field(TENANT_OVERTIME_DEFAULT_HOURS_FIELD):
        custom_field_name = f"{TENANT_SETTINGS_DOCTYPE}-{TENANT_OVERTIME_DEFAULT_HOURS_FIELD}"
        if not frappe.db.exists("Custom Field", custom_field_name):
            frappe.get_doc(
                {
                    "doctype": "Custom Field",
                    "dt": TENANT_SETTINGS_DOCTYPE,
                    "fieldname": TENANT_OVERTIME_DEFAULT_HOURS_FIELD,
                    "fieldtype": "Float",
                    "label": "Varsayilan Mesai Saati",
                    "description": "Yeni mesai girisinde varsayilan saat degeri.",
                    "default": "2",
                    "insert_after": TENANT_DEFAULT_LEAVE_ALLOCATION_DAYS_FIELD,
                }
            ).insert(ignore_permissions=True)

    if not meta.get_field(TENANT_ATTENDANCE_LOOKBACK_DAYS_FIELD):
        custom_field_name = f"{TENANT_SETTINGS_DOCTYPE}-{TENANT_ATTENDANCE_LOOKBACK_DAYS_FIELD}"
        if not frappe.db.exists("Custom Field", custom_field_name):
            frappe.get_doc(
                {
                    "doctype": "Custom Field",
                    "dt": TENANT_SETTINGS_DOCTYPE,
                    "fieldname": TENANT_ATTENDANCE_LOOKBACK_DAYS_FIELD,
                    "fieldtype": "Int",
                    "label": "Vardiya Gecmis Gun Sayisi",
                    "description": "Vardiya takibinde geriye donuk kac gun listelenecegi.",
                    "default": "30",
                    "insert_after": TENANT_OVERTIME_DEFAULT_HOURS_FIELD,
                }
            ).insert(ignore_permissions=True)

    if not meta.get_field(TENANT_DASHBOARD_CRITICAL_STOCK_LIMIT_FIELD):
        custom_field_name = f"{TENANT_SETTINGS_DOCTYPE}-{TENANT_DASHBOARD_CRITICAL_STOCK_LIMIT_FIELD}"
        if not frappe.db.exists("Custom Field", custom_field_name):
            frappe.get_doc(
                {
                    "doctype": "Custom Field",
                    "dt": TENANT_SETTINGS_DOCTYPE,
                    "fieldname": TENANT_DASHBOARD_CRITICAL_STOCK_LIMIT_FIELD,
                    "fieldtype": "Int",
                    "label": "Dashboard Kritik Stok Liste Limiti",
                    "description": "Dashboard kritik stok kartinda gosterilecek satir limiti.",
                    "default": "5",
                    "insert_after": TENANT_ATTENDANCE_LOOKBACK_DAYS_FIELD,
                }
            ).insert(ignore_permissions=True)

    if not meta.get_field(TENANT_PURCHASE_INVOICE_PAGE_SIZE_FIELD):
        custom_field_name = f"{TENANT_SETTINGS_DOCTYPE}-{TENANT_PURCHASE_INVOICE_PAGE_SIZE_FIELD}"
        if not frappe.db.exists("Custom Field", custom_field_name):
            frappe.get_doc(
                {
                    "doctype": "Custom Field",
                    "dt": TENANT_SETTINGS_DOCTYPE,
                    "fieldname": TENANT_PURCHASE_INVOICE_PAGE_SIZE_FIELD,
                    "fieldtype": "Int",
                    "label": "Alis Fatura Sayfa Boyutu",
                    "description": "Alis faturalari liste sayfa boyutu.",
                    "default": "20",
                    "insert_after": TENANT_DASHBOARD_CRITICAL_STOCK_LIMIT_FIELD,
                }
            ).insert(ignore_permissions=True)

    if not meta.get_field(TENANT_STOCK_LIST_PAGE_SIZE_FIELD):
        custom_field_name = f"{TENANT_SETTINGS_DOCTYPE}-{TENANT_STOCK_LIST_PAGE_SIZE_FIELD}"
        if not frappe.db.exists("Custom Field", custom_field_name):
            frappe.get_doc(
                {
                    "doctype": "Custom Field",
                    "dt": TENANT_SETTINGS_DOCTYPE,
                    "fieldname": TENANT_STOCK_LIST_PAGE_SIZE_FIELD,
                    "fieldtype": "Int",
                    "label": "Stok Liste Sayfa Boyutu",
                    "description": "Stok modulu listeleme sayfa boyutu.",
                    "default": "250",
                    "insert_after": TENANT_PURCHASE_INVOICE_PAGE_SIZE_FIELD,
                }
            ).insert(ignore_permissions=True)

    if not meta.get_field(TENANT_TEAM_LIST_PAGE_SIZE_FIELD):
        custom_field_name = f"{TENANT_SETTINGS_DOCTYPE}-{TENANT_TEAM_LIST_PAGE_SIZE_FIELD}"
        if not frappe.db.exists("Custom Field", custom_field_name):
            frappe.get_doc(
                {
                    "doctype": "Custom Field",
                    "dt": TENANT_SETTINGS_DOCTYPE,
                    "fieldname": TENANT_TEAM_LIST_PAGE_SIZE_FIELD,
                    "fieldtype": "Int",
                    "label": "Ekip Liste Sayfa Boyutu",
                    "description": "Ekip modulu listeleme sayfa boyutu.",
                    "default": "250",
                    "insert_after": TENANT_STOCK_LIST_PAGE_SIZE_FIELD,
                }
            ).insert(ignore_permissions=True)

    if not meta.get_field(TENANT_ZIMMET_LIST_PAGE_SIZE_FIELD):
        custom_field_name = f"{TENANT_SETTINGS_DOCTYPE}-{TENANT_ZIMMET_LIST_PAGE_SIZE_FIELD}"
        if not frappe.db.exists("Custom Field", custom_field_name):
            frappe.get_doc(
                {
                    "doctype": "Custom Field",
                    "dt": TENANT_SETTINGS_DOCTYPE,
                    "fieldname": TENANT_ZIMMET_LIST_PAGE_SIZE_FIELD,
                    "fieldtype": "Int",
                    "label": "Zimmet Liste Sayfa Boyutu",
                    "description": "Zimmet modulu listeleme sayfa boyutu.",
                    "default": "250",
                    "insert_after": TENANT_TEAM_LIST_PAGE_SIZE_FIELD,
                }
            ).insert(ignore_permissions=True)

    if not meta.get_field(TENANT_PAYROLL_STANDARD_MONTHLY_HOURS_FIELD):
        custom_field_name = f"{TENANT_SETTINGS_DOCTYPE}-{TENANT_PAYROLL_STANDARD_MONTHLY_HOURS_FIELD}"
        if not frappe.db.exists("Custom Field", custom_field_name):
            frappe.get_doc(
                {
                    "doctype": "Custom Field",
                    "dt": TENANT_SETTINGS_DOCTYPE,
                    "fieldname": TENANT_PAYROLL_STANDARD_MONTHLY_HOURS_FIELD,
                    "fieldtype": "Float",
                    "label": "Bordro Aylik Standart Saat",
                    "description": "Bordro saatlik ucret hesaplamasinda baz alinan aylik standart saat.",
                    "default": "225",
                    "insert_after": TENANT_ZIMMET_LIST_PAGE_SIZE_FIELD,
                }
            ).insert(ignore_permissions=True)

    frappe.db.commit()
    return True


def _get_leave_allocation_settings():
    _ensure_tenant_leave_settings_fields()

    auto_create = cint(
        frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_AUTO_LEAVE_ALLOCATION_FIELD) or 0
    ) == 1
    default_days = flt(
        frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_DEFAULT_LEAVE_ALLOCATION_DAYS_FIELD) or 14
    )
    if default_days <= 0:
        default_days = 14

    return {
        "auto_create_leave_allocation": auto_create,
        "default_leave_allocation_days": default_days,
    }


def _ensure_leave_settings_manager_permission():
    user_roles = set(frappe.get_roles() or [])
    if user_roles.intersection(LEAVE_SETTINGS_MANAGER_ROLES):
        return True
    frappe.throw("Izin ayarlarini degistirmek icin yetkiniz bulunmuyor.")


def _sanitize_int(value, default_value, min_value, max_value):
    number = cint(value or default_value)
    if number < min_value:
        return min_value
    if number > max_value:
        return max_value
    return number


def _sanitize_float(value, default_value, min_value, max_value):
    number = flt(value or default_value)
    if number < min_value:
        return min_value
    if number > max_value:
        return max_value
    return number


@frappe.whitelist()
def get_leave_type_settings():
    raw_leave_type_value = ""
    raw_department_value = ""
    if frappe.db.exists("DocType", TENANT_SETTINGS_DOCTYPE):
        _ensure_tenant_leave_settings_fields()
        raw_leave_type_value = frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_LEAVE_TYPE_FIELD) or ""
        raw_department_value = frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_DEPARTMENT_FIELD) or ""

    leave_types = _normalize_leave_type_names(raw_leave_type_value)
    departments = _normalize_department_names(raw_department_value)
    allocation_settings = _get_leave_allocation_settings()
    return {
        "leave_types_text": "\n".join(leave_types),
        "leave_types": leave_types,
        "departments_text": "\n".join(departments),
        "departments": departments,
        "auto_create_leave_allocation": allocation_settings["auto_create_leave_allocation"],
        "default_leave_allocation_days": allocation_settings["default_leave_allocation_days"],
    }


def _get_operational_settings():
    _ensure_tenant_leave_settings_fields()

    overtime_default_hours = _sanitize_float(
        frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_OVERTIME_DEFAULT_HOURS_FIELD),
        OPERATIONAL_SETTINGS_DEFAULTS[TENANT_OVERTIME_DEFAULT_HOURS_FIELD],
        0.5,
        24,
    )
    attendance_lookback_days = _sanitize_int(
        frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_ATTENDANCE_LOOKBACK_DAYS_FIELD),
        OPERATIONAL_SETTINGS_DEFAULTS[TENANT_ATTENDANCE_LOOKBACK_DAYS_FIELD],
        1,
        180,
    )
    dashboard_critical_stock_limit = _sanitize_int(
        frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_DASHBOARD_CRITICAL_STOCK_LIMIT_FIELD),
        OPERATIONAL_SETTINGS_DEFAULTS[TENANT_DASHBOARD_CRITICAL_STOCK_LIMIT_FIELD],
        1,
        50,
    )
    purchase_invoice_page_size = _sanitize_int(
        frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_PURCHASE_INVOICE_PAGE_SIZE_FIELD),
        OPERATIONAL_SETTINGS_DEFAULTS[TENANT_PURCHASE_INVOICE_PAGE_SIZE_FIELD],
        10,
        200,
    )
    stock_list_page_size = _sanitize_int(
        frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_STOCK_LIST_PAGE_SIZE_FIELD),
        OPERATIONAL_SETTINGS_DEFAULTS[TENANT_STOCK_LIST_PAGE_SIZE_FIELD],
        50,
        1000,
    )
    team_list_page_size = _sanitize_int(
        frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_TEAM_LIST_PAGE_SIZE_FIELD),
        OPERATIONAL_SETTINGS_DEFAULTS[TENANT_TEAM_LIST_PAGE_SIZE_FIELD],
        50,
        1000,
    )
    zimmet_list_page_size = _sanitize_int(
        frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_ZIMMET_LIST_PAGE_SIZE_FIELD),
        OPERATIONAL_SETTINGS_DEFAULTS[TENANT_ZIMMET_LIST_PAGE_SIZE_FIELD],
        50,
        1000,
    )
    payroll_standard_monthly_hours = _sanitize_float(
        frappe.db.get_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_PAYROLL_STANDARD_MONTHLY_HOURS_FIELD),
        OPERATIONAL_SETTINGS_DEFAULTS[TENANT_PAYROLL_STANDARD_MONTHLY_HOURS_FIELD],
        120,
        400,
    )

    return {
        "overtime_default_hours": overtime_default_hours,
        "attendance_lookback_days": attendance_lookback_days,
        "dashboard_critical_stock_limit": dashboard_critical_stock_limit,
        "purchase_invoice_page_size": purchase_invoice_page_size,
        "stock_list_page_size": stock_list_page_size,
        "team_list_page_size": team_list_page_size,
        "zimmet_list_page_size": zimmet_list_page_size,
        "payroll_standard_monthly_hours": payroll_standard_monthly_hours,
    }


@frappe.whitelist()
def get_operational_settings():
    return _get_operational_settings()


@frappe.whitelist()
def ensure_employee_department_link(employee=None):
    employee = (employee or "").strip()
    if not employee:
        frappe.throw("employee zorunludur.")

    if not frappe.db.exists("Employee", employee):
        frappe.throw("Employee bulunamadi.")

    department_value = (frappe.db.get_value("Employee", employee, "department") or "").strip()
    if not department_value:
        return {"ok": True, "employee": employee, "department": None, "created": False, "updated": False}

    if frappe.db.exists("Department", department_value):
        return {"ok": True, "employee": employee, "department": department_value, "created": False, "updated": False}

    matched_name = frappe.db.get_value("Department", {"department_name": department_value}, "name")
    if matched_name:
        if matched_name != department_value:
            frappe.db.set_value("Employee", employee, "department", matched_name)
            frappe.db.commit()
            return {"ok": True, "employee": employee, "department": matched_name, "created": False, "updated": True}
        return {"ok": True, "employee": employee, "department": matched_name, "created": False, "updated": False}

    employee_company = ""
    if frappe.db.has_column("Employee", "company"):
        employee_company = (frappe.db.get_value("Employee", employee, "company") or "").strip()

    created = _ensure_department_master(department_value, company=employee_company)
    created_name = created.get("name") or department_value

    if created_name != department_value:
        frappe.db.set_value("Employee", employee, "department", created_name)
        frappe.db.commit()
        return {"ok": True, "employee": employee, "department": created_name, "created": bool(created.get("created")), "updated": True}

    return {"ok": True, "employee": employee, "department": created_name, "created": bool(created.get("created")), "updated": False}


@frappe.whitelist()
def save_leave_type_settings(
    leave_types_text=None,
    departments_text=None,
    auto_create_leave_allocation=None,
    default_leave_allocation_days=None,
):
    _ensure_leave_settings_manager_permission()

    _ensure_tenant_leave_settings_fields()

    leave_types = _normalize_leave_type_names(leave_types_text or "")
    departments = _normalize_department_names(departments_text or "")
    joined_value = "\n".join(leave_types)
    joined_departments_value = "\n".join(departments)
    frappe.db.set_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_LEAVE_TYPE_FIELD, joined_value)
    frappe.db.set_single_value(TENANT_SETTINGS_DOCTYPE, TENANT_DEPARTMENT_FIELD, joined_departments_value)

    auto_create_leave_allocation = cint(auto_create_leave_allocation or 0) == 1
    default_leave_allocation_days = flt(default_leave_allocation_days or 14)
    if default_leave_allocation_days <= 0:
        default_leave_allocation_days = 14

    frappe.db.set_single_value(
        TENANT_SETTINGS_DOCTYPE,
        TENANT_AUTO_LEAVE_ALLOCATION_FIELD,
        1 if auto_create_leave_allocation else 0,
    )
    frappe.db.set_single_value(
        TENANT_SETTINGS_DOCTYPE,
        TENANT_DEFAULT_LEAVE_ALLOCATION_DAYS_FIELD,
        default_leave_allocation_days,
    )

    synced = []
    for leave_type_name in leave_types:
        synced.append(_ensure_leave_type_master(leave_type_name))

    synced_departments = []
    for department_name in departments:
        synced_departments.append(_ensure_department_master(department_name))

    frappe.db.commit()
    return {
        "leave_types_text": joined_value,
        "leave_types": leave_types,
        "departments_text": joined_departments_value,
        "departments": departments,
        "auto_create_leave_allocation": auto_create_leave_allocation,
        "default_leave_allocation_days": default_leave_allocation_days,
        "synced": synced,
        "synced_departments": synced_departments,
    }


@frappe.whitelist()
def save_operational_settings(
    overtime_default_hours=None,
    attendance_lookback_days=None,
    dashboard_critical_stock_limit=None,
    purchase_invoice_page_size=None,
    stock_list_page_size=None,
    team_list_page_size=None,
    zimmet_list_page_size=None,
    payroll_standard_monthly_hours=None,
):
    _ensure_leave_settings_manager_permission()
    _ensure_tenant_leave_settings_fields()

    sanitized = {
        "overtime_default_hours": _sanitize_float(
            overtime_default_hours,
            OPERATIONAL_SETTINGS_DEFAULTS[TENANT_OVERTIME_DEFAULT_HOURS_FIELD],
            0.5,
            24,
        ),
        "attendance_lookback_days": _sanitize_int(
            attendance_lookback_days,
            OPERATIONAL_SETTINGS_DEFAULTS[TENANT_ATTENDANCE_LOOKBACK_DAYS_FIELD],
            1,
            180,
        ),
        "dashboard_critical_stock_limit": _sanitize_int(
            dashboard_critical_stock_limit,
            OPERATIONAL_SETTINGS_DEFAULTS[TENANT_DASHBOARD_CRITICAL_STOCK_LIMIT_FIELD],
            1,
            50,
        ),
        "purchase_invoice_page_size": _sanitize_int(
            purchase_invoice_page_size,
            OPERATIONAL_SETTINGS_DEFAULTS[TENANT_PURCHASE_INVOICE_PAGE_SIZE_FIELD],
            10,
            200,
        ),
        "stock_list_page_size": _sanitize_int(
            stock_list_page_size,
            OPERATIONAL_SETTINGS_DEFAULTS[TENANT_STOCK_LIST_PAGE_SIZE_FIELD],
            50,
            1000,
        ),
        "team_list_page_size": _sanitize_int(
            team_list_page_size,
            OPERATIONAL_SETTINGS_DEFAULTS[TENANT_TEAM_LIST_PAGE_SIZE_FIELD],
            50,
            1000,
        ),
        "zimmet_list_page_size": _sanitize_int(
            zimmet_list_page_size,
            OPERATIONAL_SETTINGS_DEFAULTS[TENANT_ZIMMET_LIST_PAGE_SIZE_FIELD],
            50,
            1000,
        ),
        "payroll_standard_monthly_hours": _sanitize_float(
            payroll_standard_monthly_hours,
            OPERATIONAL_SETTINGS_DEFAULTS[TENANT_PAYROLL_STANDARD_MONTHLY_HOURS_FIELD],
            120,
            400,
        ),
    }

    frappe.db.set_single_value(
        TENANT_SETTINGS_DOCTYPE,
        TENANT_OVERTIME_DEFAULT_HOURS_FIELD,
        sanitized["overtime_default_hours"],
    )
    frappe.db.set_single_value(
        TENANT_SETTINGS_DOCTYPE,
        TENANT_ATTENDANCE_LOOKBACK_DAYS_FIELD,
        sanitized["attendance_lookback_days"],
    )
    frappe.db.set_single_value(
        TENANT_SETTINGS_DOCTYPE,
        TENANT_DASHBOARD_CRITICAL_STOCK_LIMIT_FIELD,
        sanitized["dashboard_critical_stock_limit"],
    )
    frappe.db.set_single_value(
        TENANT_SETTINGS_DOCTYPE,
        TENANT_PURCHASE_INVOICE_PAGE_SIZE_FIELD,
        sanitized["purchase_invoice_page_size"],
    )
    frappe.db.set_single_value(
        TENANT_SETTINGS_DOCTYPE,
        TENANT_STOCK_LIST_PAGE_SIZE_FIELD,
        sanitized["stock_list_page_size"],
    )
    frappe.db.set_single_value(
        TENANT_SETTINGS_DOCTYPE,
        TENANT_TEAM_LIST_PAGE_SIZE_FIELD,
        sanitized["team_list_page_size"],
    )
    frappe.db.set_single_value(
        TENANT_SETTINGS_DOCTYPE,
        TENANT_ZIMMET_LIST_PAGE_SIZE_FIELD,
        sanitized["zimmet_list_page_size"],
    )
    frappe.db.set_single_value(
        TENANT_SETTINGS_DOCTYPE,
        TENANT_PAYROLL_STANDARD_MONTHLY_HOURS_FIELD,
        sanitized["payroll_standard_monthly_hours"],
    )
    frappe.db.commit()

    return sanitized


@frappe.whitelist()
def ensure_leave_allocation_for_request(employee=None, leave_type=None, from_date=None, to_date=None):
    employee = (employee or "").strip()
    leave_type = (leave_type or "").strip()
    from_date = (from_date or "").strip()
    to_date = (to_date or "").strip()

    if not employee:
        frappe.throw("employee zorunludur.")
    if not leave_type:
        frappe.throw("leave_type zorunludur.")
    if not from_date or not to_date:
        frappe.throw("from_date ve to_date zorunludur.")

    settings = _get_leave_allocation_settings()
    if not settings["auto_create_leave_allocation"]:
        return {"ok": False, "created": False, "reason": "auto_create_disabled"}

    start_date = getdate(from_date)
    end_date = getdate(to_date)

    if end_date < start_date:
        frappe.throw("to_date from_date tarihinden once olamaz.")

    # Cross-year leave periods are not auto-covered to avoid oversized allocation ranges.
    if start_date.year != end_date.year:
        return {"ok": False, "created": False, "reason": "cross_year_range_not_supported"}

    existing = frappe.get_all(
        "Leave Allocation",
        fields=["name", "from_date", "to_date", "docstatus"],
        filters={
            "employee": employee,
            "leave_type": leave_type,
            "docstatus": 1,
            "from_date": ["<=", str(start_date)],
            "to_date": [">=", str(end_date)],
        },
        limit_page_length=1,
        order_by="from_date asc",
    )

    if existing:
        return {"ok": True, "created": False, "allocation": existing[0]}

    allocation_from = f"{start_date.year}-01-01"
    allocation_to = f"{start_date.year}-12-31"
    allocation_days = settings["default_leave_allocation_days"]

    payload = {
        "doctype": "Leave Allocation",
        "employee": employee,
        "leave_type": leave_type,
        "from_date": allocation_from,
        "to_date": allocation_to,
        "new_leaves_allocated": allocation_days,
    }

    if frappe.db.has_column("Leave Allocation", "total_leaves_allocated"):
        payload["total_leaves_allocated"] = allocation_days

    if frappe.db.has_column("Leave Allocation", "carry_forward"):
        payload["carry_forward"] = 0

    if frappe.db.has_column("Employee", "company") and frappe.db.has_column("Leave Allocation", "company"):
        company = frappe.db.get_value("Employee", employee, "company")
        if company:
            payload["company"] = company

    doc = frappe.get_doc(payload).insert(ignore_permissions=True, ignore_mandatory=True)

    try:
        doc.submit()
    except Exception:
        # Some tenants may use custom workflows; keep doc saved and mark as draft-safe fallback.
        pass

    frappe.db.commit()

    return {
        "ok": True,
        "created": True,
        "allocation": {
            "name": doc.name,
            "from_date": doc.get("from_date"),
            "to_date": doc.get("to_date"),
            "docstatus": doc.get("docstatus"),
        },
        "settings": settings,
    }

