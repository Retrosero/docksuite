import json
import os
import re
import subprocess
from pathlib import Path

import frappe

from shipyard_app import operations_support
from shipyard_app import pre_accounting_nes_portal
from shipyard_app import productization
from shipyard_app import stabilization
from shipyard_app.platform import api as platform_api


TENANT_SETTINGS_DOCTYPE = "Tenant Settings"
DEFAULT_ROLES = [
    "Shipyard Worker",
    "Shipyard Foreman",
    "Shipyard Engineer",
    "Shipyard Manager",
    "Shipyard Storekeeper",
    "Shipyard HR",
]
DEFAULT_PRIMARY_COLOR = "#0B3C5D"
DEFAULT_SECONDARY_COLOR = "#328CC1"
DEFAULT_ACCENT_COLOR = "#D9B310"
DEFAULT_GENDER_ROWS = ["Male", "Female", "Other", "Prefer not to say"]


def _tenant_site():
    return getattr(frappe.local, "site", "") or ""


def _create_custom_doctype(
    doctype_name,
    fields,
    title_field,
    search_fields,
    *,
    autoname="hash",
    naming_rule="Random",
    issingle=0,
    istable=0,
):
    if frappe.db.exists("DocType", doctype_name):
        return {"created": False, "name": doctype_name}

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": doctype_name,
            "module": "Shipyard App",
            "custom": 1,
            "issingle": issingle,
            "istable": istable,
            "autoname": autoname if not issingle else "",
            "naming_rule": naming_rule if not issingle else "",
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


def _ensure_custom_field(dt, fieldname, fieldtype, label, **kwargs):
    if not frappe.db.exists("DocType", dt):
        return {"created": False, "reason": "doctype_missing", "name": f"{dt}-{fieldname}"}

    meta = frappe.get_meta(dt)
    if meta.get_field(fieldname):
        return {"created": False, "exists": True, "name": f"{dt}-{fieldname}"}

    custom_field_name = f"{dt}-{fieldname}"
    if frappe.db.exists("Custom Field", custom_field_name):
        return {"created": False, "exists": True, "name": custom_field_name}

    payload = {
        "doctype": "Custom Field",
        "dt": dt,
        "fieldname": fieldname,
        "fieldtype": fieldtype,
        "label": label,
        **kwargs,
    }
    doc = frappe.get_doc(payload).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": doc.name}


def ensure_tenant_settings_doctype():
    """Create tenant-level onboarding and branding settings (single record)."""
    result = _create_custom_doctype(
        TENANT_SETTINGS_DOCTYPE,
        [
            {
                "fieldname": "tenant_site",
                "label": "Tenant Site",
                "fieldtype": "Data",
                "read_only": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "company_name",
                "label": "Firma Adi",
                "fieldtype": "Data",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "tenant_display_name",
                "label": "Gorunen Firma Adi",
                "fieldtype": "Data",
            },
            {
                "fieldname": "default_language",
                "label": "Varsayilan Dil",
                "fieldtype": "Select",
                "options": "tr\nen",
                "default": "tr",
            },
            {
                "fieldname": "default_timezone",
                "label": "Varsayilan Saat Dilimi",
                "fieldtype": "Data",
                "default": "Europe/Istanbul",
            },
            {
                "fieldname": "brand_logo",
                "label": "Logo",
                "fieldtype": "Attach Image",
            },
            {
                "fieldname": "primary_color",
                "label": "Ana Renk",
                "fieldtype": "Color",
                "default": DEFAULT_PRIMARY_COLOR,
            },
            {
                "fieldname": "secondary_color",
                "label": "Ikincil Renk",
                "fieldtype": "Color",
                "default": DEFAULT_SECONDARY_COLOR,
            },
            {
                "fieldname": "accent_color",
                "label": "Vurgu Rengi",
                "fieldtype": "Color",
                "default": DEFAULT_ACCENT_COLOR,
            },
            {
                "fieldname": "default_user_email",
                "label": "Varsayilan Kullanici E-Posta",
                "fieldtype": "Data",
            },
            {
                "fieldname": "default_user_first_name",
                "label": "Varsayilan Kullanici Adi",
                "fieldtype": "Data",
                "default": "Tenant",
            },
            {
                "fieldname": "default_user_last_name",
                "label": "Varsayilan Kullanici Soyadi",
                "fieldtype": "Data",
                "default": "Manager",
            },
            {
                "fieldname": "create_demo_data",
                "label": "Demo Veri Yukle",
                "fieldtype": "Check",
                "default": "0",
            },
            {
                "fieldname": "shipyard_leave_types",
                "label": "Izin Turleri",
                "fieldtype": "Small Text",
                "description": "Her satira bir ERPNext Leave Type adi yazin.",
            },
            {
                "fieldname": "shipyard_departments",
                "label": "Departmanlar",
                "fieldtype": "Small Text",
                "description": "Her satira bir ERPNext Department adi yazin.",
            },
            {
                "fieldname": "shipyard_auto_leave_allocation",
                "label": "Izin Tahsisini Otomatik Olustur",
                "fieldtype": "Check",
                "default": "0",
                "description": "Izin basvurusunda aktif tahsis yoksa otomatik Leave Allocation olusturur.",
            },
            {
                "fieldname": "shipyard_default_leave_allocation_days",
                "label": "Varsayilan Izin Tahsis Gunu",
                "fieldtype": "Float",
                "default": "14",
                "description": "Otomatik tahsis acikken yeni tahsis icin kullanilacak gun sayisi.",
            },
            {
                "fieldname": "shipyard_overtime_default_hours",
                "label": "Varsayilan Mesai Saati",
                "fieldtype": "Float",
                "default": "2",
                "description": "Yeni mesai girisinde varsayilan saat degeri.",
            },
            {
                "fieldname": "shipyard_attendance_lookback_days",
                "label": "Vardiya Gecmis Gun Sayisi",
                "fieldtype": "Int",
                "default": "30",
                "description": "Vardiya takibinde geriye donuk kac gun listelenecegi.",
            },
            {
                "fieldname": "shipyard_dashboard_critical_stock_limit",
                "label": "Dashboard Kritik Stok Liste Limiti",
                "fieldtype": "Int",
                "default": "5",
                "description": "Dashboard kritik stok kartinda gosterilecek satir limiti.",
            },
            {
                "fieldname": "shipyard_stock_warning_multiplier",
                "label": "Stok Uyari Carpani",
                "fieldtype": "Float",
                "default": "1.5",
                "description": "Kritik esige gore uyari araligini belirleyen carpan degeri.",
            },
            {
                "fieldname": "shipyard_purchase_invoice_page_size",
                "label": "Alis Fatura Sayfa Boyutu",
                "fieldtype": "Int",
                "default": "20",
                "description": "Alis faturalari liste sayfa boyutu.",
            },
            {
                "fieldname": "shipyard_stock_list_page_size",
                "label": "Stok Liste Sayfa Boyutu",
                "fieldtype": "Int",
                "default": "250",
                "description": "Stok modulu listeleme sayfa boyutu.",
            },
            {
                "fieldname": "shipyard_team_list_page_size",
                "label": "Ekip Liste Sayfa Boyutu",
                "fieldtype": "Int",
                "default": "250",
                "description": "Ekip modulu listeleme sayfa boyutu.",
            },
            {
                "fieldname": "shipyard_zimmet_list_page_size",
                "label": "Zimmet Liste Sayfa Boyutu",
                "fieldtype": "Int",
                "default": "250",
                "description": "Zimmet modulu listeleme sayfa boyutu.",
            },
            {
                "fieldname": "shipyard_payroll_standard_monthly_hours",
                "label": "Bordro Aylik Standart Saat",
                "fieldtype": "Float",
                "default": "225",
                "description": "Bordro saatlik ucret hesaplamasinda baz alinan aylik standart saat.",
            },
        ],
        title_field="company_name",
        search_fields="tenant_site,company_name,default_user_email",
        issingle=1,
    )
    ensure_tenant_settings_extensions()
    return result


def ensure_tenant_settings_extensions():
    """Ensure reusable tenant settings custom fields exist on existing sites."""
    return {
        "shipyard_leave_types": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_leave_types",
            "Small Text",
            "Izin Turleri",
            description="Her satira bir ERPNext Leave Type adi yazin.",
            insert_after="create_demo_data",
        ),
        "shipyard_departments": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_departments",
            "Small Text",
            "Departmanlar",
            description="Her satira bir ERPNext Department adi yazin.",
            insert_after="shipyard_leave_types",
        ),
        "shipyard_auto_leave_allocation": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_auto_leave_allocation",
            "Check",
            "Izin Tahsisini Otomatik Olustur",
            default="0",
            description="Izin basvurusunda aktif tahsis yoksa otomatik Leave Allocation olusturur.",
            insert_after="shipyard_departments",
        ),
        "shipyard_default_leave_allocation_days": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_default_leave_allocation_days",
            "Float",
            "Varsayilan Izin Tahsis Gunu",
            default="14",
            description="Otomatik tahsis acikken yeni tahsis icin kullanilacak gun sayisi.",
            insert_after="shipyard_auto_leave_allocation",
        ),
        "shipyard_overtime_default_hours": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_overtime_default_hours",
            "Float",
            "Varsayilan Mesai Saati",
            default="2",
            description="Yeni mesai girisinde varsayilan saat degeri.",
            insert_after="shipyard_default_leave_allocation_days",
        ),
        "shipyard_attendance_lookback_days": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_attendance_lookback_days",
            "Int",
            "Vardiya Gecmis Gun Sayisi",
            default="30",
            description="Vardiya takibinde geriye donuk kac gun listelenecegi.",
            insert_after="shipyard_overtime_default_hours",
        ),
        "shipyard_dashboard_critical_stock_limit": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_dashboard_critical_stock_limit",
            "Int",
            "Dashboard Kritik Stok Liste Limiti",
            default="5",
            description="Dashboard kritik stok kartinda gosterilecek satir limiti.",
            insert_after="shipyard_attendance_lookback_days",
        ),
        "shipyard_stock_warning_multiplier": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_stock_warning_multiplier",
            "Float",
            "Stok Uyari Carpani",
            default="1.5",
            description="Kritik esige gore uyari araligini belirleyen carpan degeri.",
            insert_after="shipyard_dashboard_critical_stock_limit",
        ),
        "shipyard_purchase_invoice_page_size": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_purchase_invoice_page_size",
            "Int",
            "Alis Fatura Sayfa Boyutu",
            default="20",
            description="Alis faturalari liste sayfa boyutu.",
            insert_after="shipyard_stock_warning_multiplier",
        ),
        "shipyard_stock_list_page_size": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_stock_list_page_size",
            "Int",
            "Stok Liste Sayfa Boyutu",
            default="250",
            description="Stok modulu listeleme sayfa boyutu.",
            insert_after="shipyard_purchase_invoice_page_size",
        ),
        "shipyard_team_list_page_size": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_team_list_page_size",
            "Int",
            "Ekip Liste Sayfa Boyutu",
            default="250",
            description="Ekip modulu listeleme sayfa boyutu.",
            insert_after="shipyard_stock_list_page_size",
        ),
        "shipyard_zimmet_list_page_size": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_zimmet_list_page_size",
            "Int",
            "Zimmet Liste Sayfa Boyutu",
            default="250",
            description="Zimmet modulu listeleme sayfa boyutu.",
            insert_after="shipyard_team_list_page_size",
        ),
        "shipyard_payroll_standard_monthly_hours": _ensure_custom_field(
            TENANT_SETTINGS_DOCTYPE,
            "shipyard_payroll_standard_monthly_hours",
            "Float",
            "Bordro Aylik Standart Saat",
            default="225",
            description="Bordro saatlik ucret hesaplamasinda baz alinan aylik standart saat.",
            insert_after="shipyard_zimmet_list_page_size",
        ),
    }


def ensure_overtime_request_doctype():
    """Create Overtime Request as a reusable custom DocType when missing."""
    return _create_custom_doctype(
        "Overtime Request",
        [
            {
                "fieldname": "employee",
                "label": "Calisan",
                "fieldtype": "Link",
                "options": "Employee",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "employee_name",
                "label": "Calisan Adi",
                "fieldtype": "Data",
                "fetch_from": "employee.employee_name",
                "read_only": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "date",
                "label": "Mesai Tarihi",
                "fieldtype": "Date",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "hours",
                "label": "Saat",
                "fieldtype": "Float",
                "reqd": 1,
            },
            {
                "fieldname": "reason",
                "label": "Aciklama",
                "fieldtype": "Small Text",
            },
            {
                "fieldname": "status",
                "label": "Durum",
                "fieldtype": "Select",
                "options": "Open\nApproved\nRejected\nCancelled",
                "default": "Open",
                "in_list_view": 1,
            },
        ],
        title_field="employee_name",
        search_fields="employee,employee_name,status,date",
    )


def ensure_overtime_batch_doctypes():
    batch_line = _create_custom_doctype(
        "Overtime Batch Line",
        [
            {
                "fieldname": "employee",
                "label": "Calisan",
                "fieldtype": "Link",
                "options": "Employee",
                "in_list_view": 1,
                "reqd": 1,
            },
            {
                "fieldname": "employee_name",
                "label": "Calisan Adi",
                "fieldtype": "Data",
                "fetch_from": "employee.employee_name",
                "read_only": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "request_ref",
                "label": "Mesai Kaydi",
                "fieldtype": "Link",
                "options": "Overtime Request",
                "in_list_view": 1,
            },
            {
                "fieldname": "line_status",
                "label": "Satir Durumu",
                "fieldtype": "Select",
                "options": "Created\nSkipped\nFailed",
                "default": "Created",
                "in_list_view": 1,
            },
            {
                "fieldname": "message",
                "label": "Mesaj",
                "fieldtype": "Small Text",
            },
        ],
        title_field="employee_name",
        search_fields="employee,employee_name,request_ref,line_status",
        autoname="hash",
        naming_rule="Random",
        istable=1,
    )

    batch = _create_custom_doctype(
        "Overtime Batch",
        [
            {
                "fieldname": "batch_date",
                "label": "Mesai Tarihi",
                "fieldtype": "Date",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "hours",
                "label": "Saat",
                "fieldtype": "Float",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "reason",
                "label": "Aciklama",
                "fieldtype": "Small Text",
            },
            {
                "fieldname": "created_by",
                "label": "Olusturan",
                "fieldtype": "Link",
                "options": "User",
                "read_only": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "status",
                "label": "Durum",
                "fieldtype": "Select",
                "options": "Draft\nCompleted\nPartial\nFailed",
                "default": "Draft",
                "in_list_view": 1,
            },
            {
                "fieldname": "total_employees",
                "label": "Toplam Personel",
                "fieldtype": "Int",
                "default": "0",
                "in_list_view": 1,
                "read_only": 1,
            },
            {
                "fieldname": "success_count",
                "label": "Basarili",
                "fieldtype": "Int",
                "default": "0",
                "in_list_view": 1,
                "read_only": 1,
            },
            {
                "fieldname": "failed_count",
                "label": "Basarisiz",
                "fieldtype": "Int",
                "default": "0",
                "in_list_view": 1,
                "read_only": 1,
            },
            {
                "fieldname": "lines",
                "label": "Satirlar",
                "fieldtype": "Table",
                "options": "Overtime Batch Line",
            },
        ],
        title_field="batch_date",
        search_fields="batch_date,status,created_by",
    )

    return {"batch": batch, "batch_line": batch_line}


def ensure_employee_document_record_doctype():
    """Create Employee Document Record as reusable HR document registry."""
    return _create_custom_doctype(
        "Employee Document Record",
        [
            {
                "fieldname": "employee",
                "label": "Calisan",
                "fieldtype": "Link",
                "options": "Employee",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "employee_name",
                "label": "Calisan Adi",
                "fieldtype": "Data",
                "fetch_from": "employee.employee_name",
                "read_only": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "document_type",
                "label": "Belge Turu",
                "fieldtype": "Data",
                "reqd": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "file_ref",
                "label": "Dosya",
                "fieldtype": "Link",
                "options": "File",
            },
            {
                "fieldname": "issue_date",
                "label": "Belge Tarihi",
                "fieldtype": "Date",
            },
            {
                "fieldname": "expiry_date",
                "label": "Gecerlilik Bitis",
                "fieldtype": "Date",
                "in_list_view": 1,
            },
            {
                "fieldname": "status",
                "label": "Durum",
                "fieldtype": "Select",
                "options": "Missing\nPending Review\nValid\nExpiring Soon\nExpired",
                "default": "Missing",
                "in_list_view": 1,
            },
            {
                "fieldname": "is_required",
                "label": "Zorunlu",
                "fieldtype": "Check",
                "default": "1",
            },
            {
                "fieldname": "note",
                "label": "Not",
                "fieldtype": "Small Text",
            },
        ],
        title_field="document_type",
        search_fields="employee,employee_name,document_type,status",
    )


def ensure_overtime_request_extensions():
    return {
        "overtime_batch": _ensure_custom_field(
            "Overtime Request",
            "overtime_batch",
            "Link",
            "Mesai Grup Kaydi",
            options="Overtime Batch",
            insert_after="reason",
        ),
        "approved_by": _ensure_custom_field(
            "Overtime Request",
            "approved_by",
            "Link",
            "Onaylayan",
            options="User",
            read_only=1,
            insert_after="status",
        ),
        "approved_at": _ensure_custom_field(
            "Overtime Request",
            "approved_at",
            "Datetime",
            "Onay Zamani",
            read_only=1,
            insert_after="approved_by",
        ),
        "rejection_reason": _ensure_custom_field(
            "Overtime Request",
            "rejection_reason",
            "Small Text",
            "Red Nedeni",
            insert_after="approved_at",
        ),
    }


def ensure_stock_alert_action_event_doctype():
    """Create persistent stock alert action event records for tenant audit trails."""
    return _create_custom_doctype(
        "Stock Alert Action Event",
        [
            {
                "fieldname": "event_key",
                "label": "Event Anahtari",
                "fieldtype": "Data",
                "reqd": 1,
                "unique": 1,
                "in_list_view": 1,
            },
            {
                "fieldname": "item_code",
                "label": "Urun",
                "fieldtype": "Link",
                "options": "Item",
                "in_list_view": 1,
            },
            {
                "fieldname": "item_name",
                "label": "Urun Adi",
                "fieldtype": "Data",
                "in_list_view": 1,
            },
            {
                "fieldname": "trigger_label",
                "label": "Tetikleyici",
                "fieldtype": "Data",
                "in_list_view": 1,
            },
            {
                "fieldname": "action_label",
                "label": "Aksiyon",
                "fieldtype": "Data",
                "in_list_view": 1,
            },
            {
                "fieldname": "result_label",
                "label": "Sonuc",
                "fieldtype": "Data",
                "in_list_view": 1,
            },
            {
                "fieldname": "result_tone",
                "label": "Sonuc Seviyesi",
                "fieldtype": "Select",
                "options": "success\nwarning\ncritical",
                "default": "warning",
                "in_list_view": 1,
            },
            {
                "fieldname": "event_time",
                "label": "Event Zamani",
                "fieldtype": "Datetime",
                "in_list_view": 1,
            },
            {
                "fieldname": "source",
                "label": "Kaynak",
                "fieldtype": "Data",
                "default": "stock_screen",
            },
            {
                "fieldname": "payload_json",
                "label": "Payload",
                "fieldtype": "Code",
                "options": "JSON",
            },
        ],
        title_field="event_key",
        search_fields="event_key,item_code,item_name,result_tone",
    )


def _get_site_safe_email():
    site = _tenant_site() or "tenant.local"
    safe_domain = site.replace(":", "-").replace("/", "-")
    if "." not in safe_domain:
        safe_domain = f"{safe_domain}.local"
    return f"admin@{safe_domain}"


def _set_single_values(doctype_name, values):
    if not frappe.db.exists("DocType", doctype_name):
        return {"updated": False, "reason": "doctype_missing"}

    meta = frappe.get_meta(doctype_name)
    valid_fields = {field.fieldname for field in meta.fields}
    updated = {}

    for key, value in values.items():
        if key in valid_fields and value is not None and value != "":
            frappe.db.set_single_value(doctype_name, key, value)
            updated[key] = value

    if updated:
        frappe.db.commit()
    return {"updated": bool(updated), "fields": updated}


def ensure_default_roles(role_names=None):
    """Create shipyard-specific default roles that can be reused per tenant."""
    role_names = role_names or DEFAULT_ROLES
    created = []

    for role_name in role_names:
        if frappe.db.exists("Role", role_name):
            continue
        role_doc = frappe.get_doc({"doctype": "Role", "role_name": role_name})
        role_doc.insert(ignore_permissions=True)
        created.append(role_name)

    if created:
        frappe.db.commit()
    return {"created_roles": created, "existing_or_total": len(role_names)}


def ensure_gender_master_rows():
    """Ensure ERPNext Gender master rows exist so Employee link validation does not fail."""
    created = []
    for gender_name in DEFAULT_GENDER_ROWS:
        if frappe.db.exists("Gender", gender_name):
            continue
        frappe.get_doc({"doctype": "Gender", "gender": gender_name}).insert(ignore_permissions=True)
        created.append(gender_name)

    if created:
        frappe.db.commit()
    return {"created": created, "total_expected": len(DEFAULT_GENDER_ROWS)}


def _upsert_tenant_settings(settings_overrides=None):
    settings_overrides = settings_overrides or {}
    ensure_tenant_settings_doctype()
    ensure_tenant_settings_extensions()

    site_name = _tenant_site()
    base_values = {
        "tenant_site": site_name,
        "company_name": settings_overrides.get("company_name") or site_name,
        "tenant_display_name": settings_overrides.get("tenant_display_name")
        or settings_overrides.get("company_name")
        or site_name,
        "default_language": settings_overrides.get("default_language") or "tr",
        "default_timezone": settings_overrides.get("default_timezone") or "Europe/Istanbul",
        "brand_logo": settings_overrides.get("brand_logo"),
        "primary_color": settings_overrides.get("primary_color") or DEFAULT_PRIMARY_COLOR,
        "secondary_color": settings_overrides.get("secondary_color")
        or DEFAULT_SECONDARY_COLOR,
        "accent_color": settings_overrides.get("accent_color") or DEFAULT_ACCENT_COLOR,
        "default_user_email": settings_overrides.get("default_user_email")
        or _get_site_safe_email(),
        "default_user_first_name": settings_overrides.get("default_user_first_name")
        or "Tenant",
        "default_user_last_name": settings_overrides.get("default_user_last_name")
        or "Manager",
        "create_demo_data": 1 if settings_overrides.get("create_demo_data") else 0,
    }
    update_result = _set_single_values(TENANT_SETTINGS_DOCTYPE, base_values)
    return {"settings": base_values, "update_result": update_result}


def ensure_default_user(email=None, first_name="Tenant", last_name="Manager", role_names=None):
    """Create a default tenant user and attach default shipyard roles."""
    email = email or _get_site_safe_email()
    role_names = role_names or DEFAULT_ROLES

    if frappe.db.exists("User", email):
        user_doc = frappe.get_doc("User", email)
        existing_roles = {role.role for role in user_doc.roles}
        updated = False
        for role_name in role_names:
            if role_name not in existing_roles:
                user_doc.append("roles", {"role": role_name})
                updated = True
        if updated:
            user_doc.save(ignore_permissions=True)
            frappe.db.commit()
        return {"created": False, "name": user_doc.name, "updated_roles": updated}

    ensure_default_roles(role_names)
    user_doc = frappe.get_doc(
        {
            "doctype": "User",
            "email": email,
            "first_name": first_name or "Tenant",
            "last_name": last_name or "Manager",
            "enabled": 1,
            "send_welcome_email": 0,
            "user_type": "System User",
            "new_password": frappe.generate_hash(length=16),
            "roles": [{"role": role_name} for role_name in role_names],
        }
    ).insert(ignore_permissions=True)
    frappe.db.commit()
    return {"created": True, "name": user_doc.name}


def apply_branding_from_settings():
    """Apply settings to standard Singles when fields are available in site."""
    settings = frappe.get_single(TENANT_SETTINGS_DOCTYPE)
    display_name = settings.tenant_display_name or settings.company_name or _tenant_site()

    system_updates = _set_single_values(
        "System Settings",
        {
            "language": settings.default_language,
            "time_zone": settings.default_timezone,
        },
    )
    website_updates = _set_single_values(
        "Website Settings",
        {
            "app_name": display_name,
            "app_logo": settings.brand_logo,
        },
    )

    return {
        "display_name": display_name,
        "primary_color": settings.primary_color,
        "secondary_color": settings.secondary_color,
        "accent_color": settings.accent_color,
        "system_settings": system_updates,
        "website_settings": website_updates,
    }


def create_demo_data():
    """Create minimal tenant-safe demo records for onboarding previews."""
    stamp = frappe.utils.now_datetime().strftime("%Y%m%d%H%M%S")
    created = {}

    employee_doc = frappe.get_doc(
        {
            "doctype": "Employee",
            "first_name": "Demo",
            "last_name": "Calisan",
            "date_of_birth": "1990-01-01",
            "date_of_joining": frappe.utils.nowdate(),
            "gender": "Male",
            "status": "Active",
            "company_email": f"demo.employee.{stamp}@example.com",
        }
    ).insert(ignore_permissions=True, ignore_mandatory=True)
    created["employee"] = employee_doc.name

    item_doc = frappe.get_doc(
        {
            "doctype": "Item",
            "item_code": f"DEMO-ITEM-{stamp}",
            "item_name": "Demo Stok Kalemi",
            "is_stock_item": 1,
        }
    ).insert(ignore_permissions=True, ignore_mandatory=True)
    created["item"] = item_doc.name

    frappe.db.commit()
    return created


def seed_sample_personnel():
    """Insert tenant-safe sample Employee rows for local/demo environments."""
    sample_people = [
        {
            "first_name": "Ahmet",
            "last_name": "Yilmaz",
            "employee_name": "Ahmet Yilmaz",
            "phone": "+905300000001",
            "email": "ahmet.yilmaz@shipyard.demo",
        },
        {
            "first_name": "Mehmet",
            "last_name": "Kaya",
            "employee_name": "Mehmet Kaya",
            "phone": "+905300000002",
            "email": "mehmet.kaya@shipyard.demo",
        },
        {
            "first_name": "Ayse",
            "last_name": "Demir",
            "employee_name": "Ayse Demir",
            "phone": "+905300000003",
            "email": "ayse.demir@shipyard.demo",
        },
        {
            "first_name": "Fatma",
            "last_name": "Sahin",
            "employee_name": "Fatma Sahin",
            "phone": "+905300000004",
            "email": "fatma.sahin@shipyard.demo",
        },
        {
            "first_name": "Can",
            "last_name": "Acar",
            "employee_name": "Can Acar",
            "phone": "+905300000005",
            "email": "can.acar@shipyard.demo",
        },
    ]

    created_or_existing = []
    for person in sample_people:
        existing = frappe.db.get_value(
            "Employee", {"employee_name": person["employee_name"]}, "name"
        )
        if existing:
            created_or_existing.append(existing)
            continue

        employee_doc = frappe.get_doc(
            {
                "doctype": "Employee",
                "first_name": person["first_name"],
                "last_name": person["last_name"],
                "employee_name": person["employee_name"],
                "status": "Active",
                "date_of_joining": frappe.utils.nowdate(),
                "cell_number": person["phone"],
                "personal_email": person["email"],
                # Company/Gender links can be tenant-specific at bootstrap stage.
                # Ignore links/mandatory to keep sample seed reusable across sites.
            }
        ).insert(ignore_permissions=True, ignore_mandatory=True, ignore_links=True)
        created_or_existing.append(employee_doc.name)

    frappe.db.commit()
    return {"employees": created_or_existing, "count": len(created_or_existing)}


def bootstrap_tenant_defaults(apply_demo_data=False, settings_overrides=None):
    """Ensure default tenant setup exists in current site."""
    ensure_tenant_settings_doctype()
    ensure_tenant_settings_extensions()
    overtime_result = ensure_overtime_request_doctype()
    overtime_batch_result = ensure_overtime_batch_doctypes()
    employee_document_record_result = ensure_employee_document_record_doctype()
    stock_alert_action_event_result = ensure_stock_alert_action_event_doctype()
    nes_portal_fields_result = pre_accounting_nes_portal.ensure_nes_portal_sales_invoice_fields()
    overtime_field_result = ensure_overtime_request_extensions()
    gender_result = ensure_gender_master_rows()
    role_result = ensure_default_roles()
    settings_result = _upsert_tenant_settings(settings_overrides=settings_overrides)
    settings = settings_result["settings"]

    user_result = ensure_default_user(
        email=settings.get("default_user_email"),
        first_name=settings.get("default_user_first_name") or "Tenant",
        last_name=settings.get("default_user_last_name") or "Manager",
    )
    branding_result = apply_branding_from_settings()

    demo_result = {"created": False}
    should_create_demo = bool(apply_demo_data or settings.get("create_demo_data"))
    if should_create_demo:
        demo_result = {"created": True, "records": create_demo_data()}

    return {
        "tenant_site": _tenant_site(),
        "tenant_settings_doctype": TENANT_SETTINGS_DOCTYPE,
        "overtime_request_doctype": overtime_result,
        "overtime_batch_doctypes": overtime_batch_result,
        "employee_document_record_doctype": employee_document_record_result,
        "stock_alert_action_event_doctype": stock_alert_action_event_result,
        "nes_portal_sales_invoice_fields": nes_portal_fields_result,
        "overtime_request_extensions": overtime_field_result,
        "gender_master": gender_result,
        "roles": role_result,
        "default_user": user_result,
        "branding": branding_result,
        "demo_data": demo_result,
    }


def bootstrap_shipyard_setup():
    """Combined setup flow for install/migrate hooks."""
    return {
        "stabilization": stabilization.bootstrap_system_stabilization(),
        "operations_support": operations_support.bootstrap_support_operations(),
        "productization": productization.bootstrap_productization(),
        "platform": platform_api.bootstrap_platform_layer(),
        "overtime_request_doctype": ensure_overtime_request_doctype(),
        "overtime_batch_doctypes": ensure_overtime_batch_doctypes(),
        "employee_document_record_doctype": ensure_employee_document_record_doctype(),
        "stock_alert_action_event_doctype": ensure_stock_alert_action_event_doctype(),
        "overtime_request_extensions": ensure_overtime_request_extensions(),
        "tenant_onboarding": bootstrap_tenant_defaults(),
    }


def _resolve_bench_path():
    env_path = os.environ.get("SHIPYARD_BENCH_PATH", "").strip()
    if env_path:
        return Path(env_path).resolve()

    get_bench_path = getattr(frappe.utils, "get_bench_path", None)
    if callable(get_bench_path):
        try:
            return Path(get_bench_path()).resolve()
        except Exception:
            pass

    return Path.cwd()


def _run_bench_command(command):
    process = subprocess.run(
        command,
        cwd=str(_resolve_bench_path()),
        capture_output=True,
        text=True,
        check=False,
    )
    if process.returncode != 0:
        error_lines = (process.stderr or process.stdout or "").strip()
        raise frappe.ValidationError(
            f"Bench command failed ({' '.join(command[:4])} ...): {error_lines}"
        )
    return {"command": command, "stdout": process.stdout.strip()}


def _build_install_apps(install_erpnext=True, install_hrms=True):
    apps = []
    if install_erpnext:
        apps.append("erpnext")
    if install_hrms:
        apps.append("hrms")
    apps.append("shipyard_app")
    return apps


def _validate_site_name(site_name):
    if not site_name:
        frappe.throw("site_name zorunludur.")
    if not re.fullmatch(r"[a-zA-Z0-9.-]+", site_name):
        frappe.throw("site_name sadece harf, rakam, nokta ve tire icerebilir.")


@frappe.whitelist()
def create_tenant_site(
    site_name,
    admin_password,
    db_name=None,
    install_erpnext=1,
    install_hrms=1,
    with_demo_data=0,
    company_name=None,
    tenant_display_name=None,
    brand_logo=None,
    primary_color=None,
    secondary_color=None,
    accent_color=None,
    default_user_email=None,
    default_user_first_name="Tenant",
    default_user_last_name="Manager",
    mariadb_root_username=None,
    mariadb_root_password=None,
):
    """Create a new tenant site and apply default shipyard setup automatically."""
    frappe.only_for("System Manager")
    _validate_site_name(site_name)
    if not admin_password:
        frappe.throw("admin_password zorunludur.")

    setup_steps = []
    new_site_command = [
        "bench",
        "new-site",
        site_name,
        "--admin-password",
        admin_password,
    ]
    if db_name:
        new_site_command.extend(["--db-name", db_name])
    if mariadb_root_username:
        new_site_command.extend(["--mariadb-root-username", mariadb_root_username])
    if mariadb_root_password:
        new_site_command.extend(["--mariadb-root-password", mariadb_root_password])

    setup_steps.append(_run_bench_command(new_site_command))

    install_apps = _build_install_apps(
        install_erpnext=bool(int(install_erpnext)),
        install_hrms=bool(int(install_hrms)),
    )
    for app_name in install_apps:
        setup_steps.append(
            _run_bench_command(["bench", "--site", site_name, "install-app", app_name])
        )

    settings_overrides = {
        "company_name": company_name or site_name,
        "tenant_display_name": tenant_display_name or company_name or site_name,
        "brand_logo": brand_logo,
        "primary_color": primary_color or DEFAULT_PRIMARY_COLOR,
        "secondary_color": secondary_color or DEFAULT_SECONDARY_COLOR,
        "accent_color": accent_color or DEFAULT_ACCENT_COLOR,
        "default_user_email": default_user_email or f"admin@{site_name}",
        "default_user_first_name": default_user_first_name,
        "default_user_last_name": default_user_last_name,
        "create_demo_data": bool(int(with_demo_data)),
    }
    kwargs_payload = {
        "apply_demo_data": bool(int(with_demo_data)),
        "settings_overrides": settings_overrides,
    }

    setup_steps.append(
        _run_bench_command(
            [
                "bench",
                "--site",
                site_name,
                "execute",
                "shipyard_app.tenant_onboarding.bootstrap_tenant_defaults",
                "--kwargs",
                repr(kwargs_payload),
            ]
        )
    )

    return {
        "created": True,
        "site_name": site_name,
        "db_name": db_name or site_name.replace(".", "_"),
        "installed_apps": install_apps,
        "setup_steps": [
            {
                "command": " ".join(step["command"][:4]) + (" ..." if len(step["command"]) > 4 else ""),
                "stdout_tail": (step["stdout"] or "")[-300:],
            }
            for step in setup_steps
        ],
    }


@frappe.whitelist()
def run_current_site_default_setup(with_demo_data=0, settings_overrides=None):
    """Manual API to rerun onboarding defaults on the current tenant site."""
    frappe.only_for("System Manager")
    if isinstance(settings_overrides, str):
        try:
            settings_overrides = json.loads(settings_overrides)
        except json.JSONDecodeError:
            settings_overrides = {}
    return bootstrap_tenant_defaults(
        apply_demo_data=bool(int(with_demo_data)),
        settings_overrides=settings_overrides or {},
    )
