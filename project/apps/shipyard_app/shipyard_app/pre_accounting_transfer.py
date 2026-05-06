import json
from datetime import datetime

import frappe
from frappe import _
from frappe.utils import getdate, now_datetime


ACCOUNT_ROLES = {"Accounts User", "Accounts Manager", "System Manager"}

TRANSFER_SOFTWARE = ["Luca", "Zirve", "Orka", "Datasoft"]
DOCUMENT_TYPES = ["Sales Invoice", "Purchase Invoice", "Payment Entry", "Journal Entry"]

PACKAGE_STATUS = ["Draft", "Ready", "Exported", "Error"]


def _require_authenticated_user():
    if frappe.session.user == "Guest":
        frappe.throw(_("Bu islem icin oturum acmalisiniz."), frappe.PermissionError)


def _require_account_access():
    _require_authenticated_user()
    user_roles = set(frappe.get_roles(frappe.session.user) or [])
    if not user_roles.intersection(ACCOUNT_ROLES):
        frappe.throw(_("Bu islem icin muhasebe erisimi gerekli."), frappe.PermissionError)


def _ensure_transfer_tables():
    """Transfer ile ilgili DocType tablolarini olustur."""
    _ensure_transfer_config_table()
    _ensure_transfer_package_table()
    _ensure_transfer_log_table()


def _ensure_transfer_config_table():
    if frappe.db.exists("DocType", "Transfer Config"):
        return True
    
    doc = frappe.get_doc({
        "doctype": "DocType",
        "name": "Transfer Config",
        "module": "Shipyard App",
        "custom": 1,
        "istable": 0,
        "editable_grid": 0,
        "track_changes": 1,
        "fields": [
            {"fieldname": "software", "fieldtype": "Select", "label": "Yazilim", 
             "options": "\n".join(TRANSFER_SOFTWARE), "in_list_view": 1},
            {"fieldname": "export_path", "fieldtype": "Data", "label": "Aktarim Dizini"},
            {"fieldname": "date_format", "fieldtype": "Data", "label": "Tarih Formati", 
             "default": "%d.%m.%Y"},
            {"fieldname": "currency_code", "fieldtype": "Data", "label": "Para Birimi Kodu", 
             "default": "TRY"},
            {"fieldname": "include_cancelled", "fieldtype": "Check", "label": "Iptal Edilenleri Dahil Et"},
            {"fieldname": "active", "fieldtype": "Check", "label": "Aktif", "default": 1},
        ],
        "permissions": [
            {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1},
            {"role": "Accounts Manager", "read": 1, "write": 1},
        ],
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return True


def _ensure_transfer_package_table():
    if frappe.db.exists("DocType", "Transfer Package"):
        return True
    
    doc = frappe.get_doc({
        "doctype": "DocType",
        "name": "Transfer Package",
        "module": "Shipyard App",
        "custom": 1,
        "istable": 0,
        "editable_grid": 0,
        "track_changes": 1,
        "fields": [
            {"fieldname": "software", "fieldtype": "Link", "label": "Yazilim", 
             "options": "Transfer Config", "in_list_view": 1},
            {"fieldname": "period_start", "fieldtype": "Date", "label": "Donem Baslangici", 
             "in_list_view": 1},
            {"fieldname": "period_end", "fieldtype": "Date", "label": "Donem Bitis", 
             "in_list_view": 1},
            {"fieldname": "document_types", "fieldtype": "Table", "label": "Belge Turleri",
             "options": "Transfer Package Item"},
            {"fieldname": "status", "fieldtype": "Select", "label": "Durum", 
             "options": "\n".join(PACKAGE_STATUS), "in_list_view": 1},
            {"fieldname": "file_path", "fieldtype": "Data", "label": "Dosya Yolu"},
            {"fieldname": "record_count", "fieldtype": "Int", "label": "Kayit Sayisi", "default": 0},
            {"fieldname": "error_count", "fieldtype": "Int", "label": "Hata Sayisi", "default": 0},
            {"fieldname": "exported_at", "fieldtype": "Datetime", "label": "Aktarim Zamani"},
        ],
        "permissions": [
            {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1},
            {"role": "Accounts Manager", "read": 1, "write": 1, "create": 1},
        ],
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    
    if not frappe.db.exists("DocType", "Transfer Package Item"):
        item_doc = frappe.get_doc({
            "doctype": "DocType",
            "name": "Transfer Package Item",
            "module": "Shipyard App",
            "custom": 1,
            "istable": 1,
            "fields": [
                {"fieldname": "document_type", "fieldtype": "Select", "label": "Belge Turu",
                 "options": "\n".join(DOCUMENT_TYPES)},
                {"fieldname": "record_count", "fieldtype": "Int", "label": "Kayit Sayisi"},
            ],
        })
        item_doc.insert(ignore_permissions=True)
        frappe.db.commit()
    
    return True


def _ensure_transfer_log_table():
    if frappe.db.exists("DocType", "Transfer Log"):
        return True
    
    doc = frappe.get_doc({
        "doctype": "DocType",
        "name": "Transfer Log",
        "module": "Shipyard App",
        "custom": 1,
        "istable": 0,
        "editable_grid": 0,
        "track_changes": 1,
        "fields": [
            {"fieldname": "package_name", "fieldtype": "Link", "label": "Paket", 
             "options": "Transfer Package", "in_list_view": 1},
            {"fieldname": "document_type", "fieldtype": "Data", "label": "Belge Turu", 
             "in_list_view": 1},
            {"fieldname": "document_name", "fieldtype": "Data", "label": "Belge Adi"},
            {"fieldname": "action", "fieldtype": "Select", "label": "Islem", 
             "options": "Created\nExported\nError\nSkipped", "in_list_view": 1},
            {"fieldname": "message", "fieldtype": "Small Text", "label": "Mesaj"},
            {"fieldname": "log_data", "fieldtype": "Code", "label": "Log Verisi", 
             "options": "JSON"},
        ],
        "permissions": [
            {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1},
            {"role": "Accounts Manager", "read": 1},
        ],
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return True


@frappe.whitelist()
def setup_transfer_tables():
    """Transfer tablolarini olustur."""
    _require_account_access()
    _ensure_transfer_tables()
    return {"status": "ok", "message": "Transfer tablolari olusturuldu"}


@frappe.whitelist()
def get_transfer_software_list():
    """Desteklenen aktarim yazilimlarini dondur."""
    _require_account_access()
    return {
        "items": [
            {"id": sw, "name": sw, "format": _get_software_format(sw), "features": _get_software_features(sw)}
            for sw in TRANSFER_SOFTWARE
        ]
    }


def _get_software_format(software):
    formats = {
        "Luca": "XML/CSV",
        "Zirve": "XML",
        "Orka": "CSV",
        "Datasoft": "DBF/CSV",
    }
    return formats.get(software, "CSV")


def _get_software_features(software):
    features = {
        "Luca": ["Cari", "Fatura", "Cek/Senet", "Makbuz"],
        "Zirve": ["Cari", "Fatura", "Makbuz", "Cek"],
        "Orka": ["Cari", "Fatura", "Stok", "Hizmet"],
        "Datasoft": ["Cari", "Fatura", "Stok"],
    }
    return features.get(software, [])


@frappe.whitelist()
def get_transfer_configs():
    """Mevcut transfer konfigürasyonlarini dondur."""
    _require_account_access()
    _ensure_transfer_tables()
    
    configs = frappe.get_all(
        "Transfer Config",
        filters={"active": 1},
        fields=["name", "software", "export_path", "date_format", "currency_code"],
    )
    return {"items": configs}


@frappe.whitelist()
def create_transfer_config(**kwargs):
    """Yeni transfer konfigürasyonu olustur."""
    _require_account_access()
    _ensure_transfer_tables()
    
    software = kwargs.get("software")
    if not software or software not in TRANSFER_SOFTWARE:
        frappe.throw(_("Gecersiz yazilim."), frappe.ValidationError)
    
    existing = frappe.get_all("Transfer Config", filters={"software": software, "active": 1})
    if existing:
        frappe.throw(_("Bu yazilim icin zaten aktif konfigurasyon var."), frappe.ValidationError)
    
    doc = frappe.get_doc({
        "doctype": "Transfer Config",
        "software": software,
        "export_path": kwargs.get("export_path", ""),
        "date_format": kwargs.get("date_format", "%d.%m.%Y"),
        "currency_code": kwargs.get("currency_code", "TRY"),
        "include_cancelled": kwargs.get("include_cancelled", 0),
        "active": 1,
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    
    return {"status": "ok", "config": doc.name}


@frappe.whitelist()
def create_transfer_package(software, period_start, period_end, document_types=None):
    """Aktarim paketi olustur."""
    _require_account_access()
    _ensure_transfer_tables()
    
    period_start = getdate(period_start)
    period_end = getdate(period_end)
    
    if period_start > period_end:
        frappe.throw(_("Baslangic tarihi bitis tarihinden buyuk olamaz."), frappe.ValidationError)
    
    config = None
    if software:
        config_name = frappe.db.get_value("Transfer Config", {"software": software, "active": 1}, "name")
        if config_name:
            config = frappe.get_doc("Transfer Config", config_name)
    
    doc_types = document_types or DOCUMENT_TYPES
    
    package_doc = frappe.get_doc({
        "doctype": "Transfer Package",
        "software": config.name if config else None,
        "period_start": period_start,
        "period_end": period_end,
        "status": "Draft",
    })
    
    for dt in doc_types:
        if dt not in DOCUMENT_TYPES:
            continue
        package_doc.append("document_types", {
            "document_type": dt,
            "record_count": _count_documents(dt, period_start, period_end),
        })
    
    package_doc.insert(ignore_permissions=True)
    frappe.db.commit()
    
    _create_package_log(package_doc.name, "Package", package_doc.name, "Created", "Paket olusturuldu")
    
    return {
        "status": "ok",
        "package": package_doc.name,
        "record_count": sum(item.record_count for item in package_doc.document_types),
    }


def _count_documents(document_type, period_start, period_end):
    try:
        filters = {
            "posting_date": ["between", [period_start, period_end]],
            "docstatus": 1,
        }
        return frappe.db.count(document_type, filters)
    except Exception:
        return 0


def _create_package_log(package, document_type, document_name, action, message, log_data=None):
    log = frappe.get_doc({
        "doctype": "Transfer Log",
        "package_name": package,
        "document_type": document_type,
        "document_name": document_name,
        "action": action,
        "message": message,
        "log_data": json.dumps(log_data, ensure_ascii=True, default=str) if log_data else "",
    })
    log.insert(ignore_permissions=True)
    frappe.db.commit()


@frappe.whitelist()
def get_package_documents(package_name, document_type=None, limit=50):
    """Paket icindeki belgeleri dondur."""
    _require_account_access()
    _ensure_transfer_tables()
    
    if not frappe.db.exists("Transfer Package", package_name):
        frappe.throw(_("Paket bulunamadi."), frappe.DoesNotExistError)
    
    package = frappe.get_doc("Transfer Package", package_name)
    
    documents = []
    for item in package.document_types:
        if document_type and item.document_type != document_type:
            continue
        
        docs = _fetch_documents(item.document_type, package.period_start, package.period_end, limit)
        for doc in docs:
            doc["package_item"] = item.document_type
            documents.append(doc)
    
    return {"items": documents, "count": len(documents)}


def _fetch_documents(document_type, period_start, period_end, limit):
    try:
        fields = ["name", "posting_date", "party_name", "grand_total", "outstanding_amount"]
        if document_type == "Sales Invoice":
            fields.extend(["customer", "customer_name"])
        elif document_type == "Purchase Invoice":
            fields.extend(["supplier", "supplier_name"])
        
        return frappe.get_all(
            document_type,
            filters={
                "posting_date": ["between", [period_start, period_end]],
                "docstatus": 1,
            },
            fields=fields,
            limit_page_length=limit,
        )
    except Exception:
        return []


@frappe.whitelist()
def export_package(package_name, output_format=None):
    """Paketi disa aktar."""
    _require_account_access()
    _ensure_transfer_tables()
    
    if not frappe.db.exists("Transfer Package", package_name):
        frappe.throw(_("Paket bulunamadi."), frappe.DoesNotExistError)
    
    package = frappe.get_doc("Transfer Package", package_name)
    
    software = "CSV"
    if package.software:
        config = frappe.get_doc("Transfer Config", package.software)
        software = config.software
    
    fmt = output_format or _get_software_format(software)
    
    all_documents = []
    for item in package.document_types:
        docs = _fetch_documents(item.document_type, package.period_start, package.period_end, 1000)
        for doc in docs:
            doc["document_type"] = item.document_type
            all_documents.append(doc)
            _create_package_log(package_name, item.document_type, doc["name"], "Exported", f"{fmt} formatinda aktarildi")
    
    export_data = _format_documents(all_documents, software, fmt)
    
    package.status = "Exported"
    package.record_count = len(all_documents)
    package.exported_at = now_datetime()
    package.save(ignore_permissions=True)
    frappe.db.commit()
    
    return {
        "status": "ok",
        "package": package_name,
        "format": fmt,
        "record_count": len(all_documents),
        "data": export_data,
    }


def _format_documents(documents, software, fmt):
    """Belgelere uygun formatta donustur."""
    if software == "Luca":
        return _to_luca_format(documents)
    elif software == "Zirve":
        return _to_zirve_format(documents)
    elif software == "Orka":
        return _to_orka_format(documents)
    elif software == "Datasoft":
        return _to_datasoft_format(documents)
    else:
        return _to_csv_format(documents)


def _to_luca_format(documents):
    """Luca formatina donustur."""
    rows = []
    for doc in documents:
        rows.append({
            "BELGE_NO": doc.get("name", ""),
            "TARIH": str(doc.get("posting_date", "")),
            "TIP": doc.get("document_type", ""),
            "CARI_KODU": doc.get("party_name", ""),
            "TUTAR": float(doc.get("grand_total", 0) or 0),
            "KDV": 0,
            "TOPLAM": float(doc.get("grand_total", 0) or 0),
        })
    return {"format": "Luca XML", "rows": rows}


def _to_zirve_format(documents):
    """Zirve formatina donustur."""
    rows = []
    for doc in documents:
        rows.append({
            "EvrakNo": doc.get("name", ""),
            "Tarih": str(doc.get("posting_date", "")),
            "Tip": doc.get("document_type", ""),
            "CariKodu": doc.get("party_name", ""),
            "Tutar": float(doc.get("grand_total", 0) or 0),
        })
    return {"format": "Zirve XML", "rows": rows}


def _to_orka_format(documents):
    """Orka formatina donustur."""
    rows = []
    for doc in documents:
        rows.append({
            "DOC_NO": doc.get("name", ""),
            "DATE": str(doc.get("posting_date", "")),
            "TYPE": doc.get("document_type", ""),
            "ACCOUNT": doc.get("party_name", ""),
            "AMOUNT": float(doc.get("grand_total", 0) or 0),
        })
    return {"format": "Orka CSV", "rows": rows}


def _to_datasoft_format(documents):
    """Datasoft formatina donustur."""
    rows = []
    for doc in documents:
        rows.append({
            "DOCNUM": doc.get("name", ""),
            "DATE": str(doc.get("posting_date", "")),
            "DOCTYPE": doc.get("document_type", ""),
            "ACCCODE": doc.get("party_name", ""),
            "TOTAL": float(doc.get("grand_total", 0) or 0),
        })
    return {"format": "Datasoft DBF", "rows": rows}


def _to_csv_format(documents):
    """Standart CSV formatina donustur."""
    rows = []
    for doc in documents:
        rows.append({
            "name": doc.get("name", ""),
            "posting_date": str(doc.get("posting_date", "")),
            "document_type": doc.get("document_type", ""),
            "party_name": doc.get("party_name", ""),
            "grand_total": float(doc.get("grand_total", 0) or 0),
        })
    return {"format": "CSV", "rows": rows}


@frappe.whitelist()
def get_transfer_history(limit=50):
    """Aktarim gecmisini dondur."""
    _require_account_access()
    _ensure_transfer_tables()
    
    limit = max(1, min(int(limit or 50), 200))
    
    packages = frappe.get_all(
        "Transfer Package",
        fields=["name", "software", "period_start", "period_end", "status", 
                "record_count", "error_count", "exported_at"],
        order_by="creation desc",
        limit_page_length=limit,
    )
    
    return {"items": packages}


@frappe.whitelist()
def get_transfer_errors(package_name):
    """Paket hatalarini dondur."""
    _require_account_access()
    _ensure_transfer_tables()
    
    if not frappe.db.exists("Transfer Package", package_name):
        frappe.throw(_("Paket bulunamadi."), frappe.DoesNotExistError)
    
    errors = frappe.get_all(
        "Transfer Log",
        filters={"package_name": package_name, "action": "Error"},
        fields=["name", "document_type", "document_name", "message", "creation"],
        order_by="creation desc",
    )
    
    return {"items": errors}


@frappe.whitelist()
def delete_transfer_package(package_name):
    """Aktarim paketini sil."""
    _require_account_access()
    
    if not frappe.db.exists("Transfer Package", package_name):
        frappe.throw(_("Paket bulunamadi."), frappe.DoesNotExistError)
    
    frappe.db.delete("Transfer Log", {"package_name": package_name})
    frappe.delete_doc("Transfer Package", package_name, ignore_permissions=True)
    frappe.db.commit()
    
    return {"status": "ok", "message": "Paket silindi"}