import frappe
from frappe.utils import add_days, getdate, now_datetime, today


CHEQUE_NOTE_DOCTYPE = "Cek Senet Kaydi"
CHEQUE_NOTE_MOVEMENT_DOCTYPE = "Cek Senet Hareket"
STATUS_OPTIONS = "Portfoyde\nTahsil Edildi\nCiro Edildi\nIade\nProtesto"
KIND_OPTIONS = "Cek\nSenet"
DIRECTION_OPTIONS = "Musteriden\nTedarikciye"
MOVEMENT_TYPE_OPTIONS = "Olusturuldu\nDurum Degisti"
VALID_STATUSES = {"Portfoyde", "Tahsil Edildi", "Ciro Edildi", "Iade", "Protesto"}


def _tenant_site():
    return getattr(frappe.local, "site", "") or ""


def _current_user():
    return getattr(frappe.session, "user", "") or "Guest"


def _create_custom_doctype(
    doctype_name,
    fields,
    title_field,
    search_fields,
):
    if frappe.db.exists("DocType", doctype_name):
        return {"created": False, "name": doctype_name}

    doc = frappe.get_doc(
        {
            "doctype": "DocType",
            "name": doctype_name,
            "module": "Shipyard App",
            "custom": 1,
            "autoname": "hash",
            "naming_rule": "Random",
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


def ensure_cheque_note_doctype():
    return _create_custom_doctype(
        CHEQUE_NOTE_DOCTYPE,
        [
            {"fieldname": "tenant_site", "label": "Tenant Site", "fieldtype": "Data", "reqd": 1, "in_list_view": 1},
            {"fieldname": "kind", "label": "Belge Turu", "fieldtype": "Select", "options": KIND_OPTIONS, "reqd": 1, "in_list_view": 1},
            {"fieldname": "direction", "label": "Yon", "fieldtype": "Select", "options": DIRECTION_OPTIONS, "reqd": 1, "in_list_view": 1},
            {"fieldname": "instrument_no", "label": "Belge No", "fieldtype": "Data", "reqd": 1, "in_list_view": 1},
            {"fieldname": "party", "label": "Cari", "fieldtype": "Data", "in_list_view": 1},
            {"fieldname": "amount", "label": "Tutar", "fieldtype": "Currency", "reqd": 1, "in_list_view": 1},
            {"fieldname": "issue_date", "label": "Keside Tarihi", "fieldtype": "Date"},
            {"fieldname": "due_date", "label": "Vade Tarihi", "fieldtype": "Date", "in_list_view": 1},
            {"fieldname": "status", "label": "Durum", "fieldtype": "Select", "options": STATUS_OPTIONS, "default": "Portfoyde", "reqd": 1, "in_list_view": 1},
            {"fieldname": "note", "label": "Not", "fieldtype": "Small Text"},
            {"fieldname": "created_by_user", "label": "Olusturan", "fieldtype": "Link", "options": "User"},
            {"fieldname": "created_at", "label": "Olusturma", "fieldtype": "Datetime"},
            {"fieldname": "last_status_at", "label": "Son Durum Zamani", "fieldtype": "Datetime"},
            {"fieldname": "linked_payment_entry", "label": "Bagli Payment Entry", "fieldtype": "Link", "options": "Payment Entry"},
        ],
        title_field="instrument_no",
        search_fields="tenant_site,instrument_no,party,status",
    )


def ensure_cheque_note_movement_doctype():
    return _create_custom_doctype(
        CHEQUE_NOTE_MOVEMENT_DOCTYPE,
        [
            {"fieldname": "tenant_site", "label": "Tenant Site", "fieldtype": "Data", "reqd": 1, "in_list_view": 1},
            {"fieldname": "cheque_note", "label": "Cek Senet Kaydi", "fieldtype": "Link", "options": CHEQUE_NOTE_DOCTYPE, "reqd": 1, "in_list_view": 1},
            {"fieldname": "movement_type", "label": "Hareket Turu", "fieldtype": "Select", "options": MOVEMENT_TYPE_OPTIONS, "reqd": 1, "in_list_view": 1},
            {"fieldname": "from_status", "label": "Onceki Durum", "fieldtype": "Select", "options": STATUS_OPTIONS},
            {"fieldname": "to_status", "label": "Yeni Durum", "fieldtype": "Select", "options": STATUS_OPTIONS},
            {"fieldname": "movement_note", "label": "Hareket Notu", "fieldtype": "Small Text"},
            {"fieldname": "moved_by", "label": "Islemi Yapan", "fieldtype": "Link", "options": "User", "in_list_view": 1},
            {"fieldname": "moved_at", "label": "Islem Zamani", "fieldtype": "Datetime", "reqd": 1, "in_list_view": 1},
        ],
        title_field="cheque_note",
        search_fields="tenant_site,cheque_note,movement_type,moved_by",
    )


def _write_movement(cheque_note, movement_type, to_status, movement_note=None, from_status=None):
    ensure_cheque_note_movement_doctype()
    doc = frappe.get_doc(
        {
            "doctype": CHEQUE_NOTE_MOVEMENT_DOCTYPE,
            "tenant_site": _tenant_site(),
            "cheque_note": cheque_note,
            "movement_type": movement_type,
            "from_status": from_status,
            "to_status": to_status,
            "movement_note": movement_note,
            "moved_by": _current_user(),
            "moved_at": now_datetime().isoformat(sep=" ", timespec="seconds"),
        }
    ).insert(ignore_permissions=True)
    return doc.name


@frappe.whitelist()
def create_cheque_note(
    kind,
    direction,
    instrument_no,
    amount,
    party=None,
    issue_date=None,
    due_date=None,
    note=None,
):
    ensure_cheque_note_doctype()
    ensure_cheque_note_movement_doctype()
    if kind not in {"Cek", "Senet"}:
        frappe.throw("Belge turu gecersiz.", frappe.ValidationError)
    if direction not in {"Musteriden", "Tedarikciye"}:
        frappe.throw("Yon gecersiz.", frappe.ValidationError)
    if not instrument_no:
        frappe.throw("Belge no zorunludur.", frappe.ValidationError)

    doc = frappe.get_doc(
        {
            "doctype": CHEQUE_NOTE_DOCTYPE,
            "tenant_site": _tenant_site(),
            "kind": kind,
            "direction": direction,
            "instrument_no": instrument_no,
            "party": party,
            "amount": float(amount or 0),
            "issue_date": issue_date,
            "due_date": due_date,
            "status": "Portfoyde",
            "note": note,
            "created_by_user": _current_user(),
            "created_at": now_datetime().isoformat(sep=" ", timespec="seconds"),
            "last_status_at": now_datetime().isoformat(sep=" ", timespec="seconds"),
        }
    ).insert(ignore_permissions=True)
    _write_movement(doc.name, "Olusturuldu", "Portfoyde", movement_note=note)
    frappe.db.commit()
    return {"status": "ok", "name": doc.name}


@frappe.whitelist()
def list_cheque_notes(limit=100, status=None, kind=None, direction=None, party_query=None, due_from=None, due_to=None):
    ensure_cheque_note_doctype()
    safe_limit = max(1, min(int(limit or 100), 500))
    filters = {"tenant_site": _tenant_site()}
    if status:
        filters["status"] = status
    if kind:
        filters["kind"] = kind
    if direction:
        filters["direction"] = direction
    if party_query:
        filters["party"] = ["like", f"%{party_query.strip()}%"]
    if due_from:
        filters["due_date"] = [">=", due_from]
    if due_to:
        current_due = filters.get("due_date")
        if isinstance(current_due, list):
            filters["due_date"] = ["between", [current_due[1], due_to]]
        else:
            filters["due_date"] = ["<=", due_to]

    rows = frappe.get_all(
        CHEQUE_NOTE_DOCTYPE,
        filters=filters,
        fields=[
            "name",
            "kind",
            "direction",
            "instrument_no",
            "party",
            "amount",
            "issue_date",
            "due_date",
            "status",
            "note",
            "linked_payment_entry",
            "last_status_at",
        ],
        order_by="creation desc",
        limit_page_length=safe_limit,
    )
    return {"items": rows, "count": len(rows)}


@frappe.whitelist()
def update_cheque_note_status(name, status, movement_note=None, linked_payment_entry=None):
    ensure_cheque_note_doctype()
    ensure_cheque_note_movement_doctype()
    if status not in VALID_STATUSES:
        frappe.throw("Durum gecersiz.", frappe.ValidationError)
    if not frappe.db.exists(CHEQUE_NOTE_DOCTYPE, name):
        frappe.throw("Kayit bulunamadi.", frappe.DoesNotExistError)
    doc = frappe.get_doc(CHEQUE_NOTE_DOCTYPE, name)
    old_status = doc.status
    doc.status = status
    doc.last_status_at = now_datetime().isoformat(sep=" ", timespec="seconds")
    if linked_payment_entry:
        doc.linked_payment_entry = linked_payment_entry
    doc.save(ignore_permissions=True)
    _write_movement(
        doc.name,
        "Durum Degisti",
        status,
        movement_note=movement_note,
        from_status=old_status,
    )
    frappe.db.commit()
    return {"status": "ok", "name": doc.name}


@frappe.whitelist()
def list_cheque_note_movements(cheque_note=None, limit=100):
    ensure_cheque_note_movement_doctype()
    safe_limit = max(1, min(int(limit or 100), 500))
    filters = {"tenant_site": _tenant_site()}
    if cheque_note:
        filters["cheque_note"] = cheque_note
    rows = frappe.get_all(
        CHEQUE_NOTE_MOVEMENT_DOCTYPE,
        filters=filters,
        fields=["name", "cheque_note", "movement_type", "from_status", "to_status", "movement_note", "moved_by", "moved_at"],
        order_by="moved_at desc",
        limit_page_length=safe_limit,
    )
    return {"items": rows, "count": len(rows)}


@frappe.whitelist()
def get_cheque_note_risk_summary():
    ensure_cheque_note_doctype()
    rows = frappe.get_all(
        CHEQUE_NOTE_DOCTYPE,
        filters={"tenant_site": _tenant_site(), "status": "Portfoyde"},
        fields=["direction", "amount"],
        limit_page_length=10000,
    )
    receivable = 0.0
    payable = 0.0
    for row in rows:
        amount = float(row.get("amount") or 0)
        if row.get("direction") == "Musteriden":
            receivable += amount
        else:
            payable += amount
    return {
        "portfoy_alacak_riski": receivable,
        "portfoy_borc_riski": payable,
        "net_risk": receivable - payable,
        "open_count": len(rows),
    }


@frappe.whitelist()
def get_cheque_note_maturity_calendar(days=60):
    ensure_cheque_note_doctype()
    safe_days = max(1, min(int(days or 60), 365))
    start = today()
    end = add_days(start, safe_days)
    rows = frappe.get_all(
        CHEQUE_NOTE_DOCTYPE,
        filters={
            "tenant_site": _tenant_site(),
            "status": "Portfoyde",
            "due_date": ["<=", end],
        },
        fields=["name", "kind", "direction", "instrument_no", "party", "amount", "due_date", "status"],
        order_by="due_date asc",
        limit_page_length=5000,
    )
    overdue = []
    due_soon = []
    for row in rows:
        due_date = row.get("due_date")
        if due_date and getdate(due_date) < getdate(start):
            overdue.append(row)
        else:
            due_soon.append(row)
    return {
        "start_date": start,
        "end_date": end,
        "overdue_items": overdue,
        "due_soon_items": due_soon,
        "count": len(rows),
    }
