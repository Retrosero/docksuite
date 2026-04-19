import json

import frappe
from frappe.utils import now_datetime


def _parse_payload(payload):
    if isinstance(payload, str):
        text = payload.strip()
        if not text:
            return {}
        try:
            payload = json.loads(text)
        except Exception:
            payload = {}
    return payload if isinstance(payload, dict) else {}


def _as_float(value, default=0.0):
    try:
        return float(value)
    except Exception:
        return float(default)


def _as_int(value, default=0):
    try:
        return int(value)
    except Exception:
        return int(default)


def _unique_employee_ids(raw_values):
    if not isinstance(raw_values, (list, tuple, set)):
        return []

    seen = set()
    result = []
    for row in raw_values:
        employee_id = str(row or "").strip()
        if not employee_id or employee_id in seen:
            continue
        seen.add(employee_id)
        result.append(employee_id)
    return result


def _normalize_limit(limit):
    safe_limit = _as_int(limit, 200)
    if safe_limit < 1:
        return 1
    if safe_limit > 500:
        return 500
    return safe_limit


def _meta_has_field(doctype_name, fieldname):
    if not doctype_name or not fieldname:
        return False
    try:
        return bool(frappe.get_meta(doctype_name).get_field(fieldname))
    except Exception:
        return False


def _build_overtime_filters(employee=None, status=None, start_date=None, end_date=None):
    filters = {}
    employee = str(employee or "").strip()
    status = str(status or "").strip()
    start_date = str(start_date or "").strip()
    end_date = str(end_date or "").strip()

    if employee:
        filters["employee"] = employee
    if status:
        filters["status"] = status
    if start_date and end_date:
        filters["date"] = ["between", [start_date, end_date]]
    elif start_date:
        filters["date"] = [">=", start_date]
    elif end_date:
        filters["date"] = ["<=", end_date]
    return filters


def _post_filter_search(rows, search_text):
    query = str(search_text or "").strip().lower()
    if not query:
        return rows

    filtered = []
    for row in rows:
        haystack = " ".join(
            [
                str(row.get("employee") or ""),
                str(row.get("employee_name") or ""),
                str(row.get("reason") or ""),
            ]
        ).lower()
        if query in haystack:
            filtered.append(row)
    return filtered


@frappe.whitelist()
def list_overtime_requests(employee=None, status=None, start_date=None, end_date=None, search_text=None, limit=500):
    if not frappe.db.exists("DocType", "Overtime Request"):
        return {"count": 0, "items": []}

    filters = _build_overtime_filters(
        employee=employee,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )
    fields = [
        "name",
        "employee",
        "employee_name",
        "date",
        "hours",
        "reason",
        "status",
    ]
    if _meta_has_field("Overtime Request", "workflow_state"):
        fields.append("workflow_state")
    if _meta_has_field("Overtime Request", "overtime_batch"):
        fields.append("overtime_batch")
    if _meta_has_field("Overtime Request", "approved_by"):
        fields.append("approved_by")
    if _meta_has_field("Overtime Request", "approved_at"):
        fields.append("approved_at")
    if _meta_has_field("Overtime Request", "rejection_reason"):
        fields.append("rejection_reason")
    fields.append("modified")

    rows = frappe.get_all(
        "Overtime Request",
        fields=fields,
        filters=filters,
        order_by="date desc, modified desc",
        limit_page_length=_normalize_limit(limit),
        ignore_permissions=True,
    )
    items = _post_filter_search(rows, search_text)
    return {"count": len(items), "items": items}


@frappe.whitelist()
def create_bulk_overtime_requests(payload=None, **kwargs):
    data = _parse_payload(payload)
    if kwargs:
        data.update({key: value for key, value in kwargs.items() if value is not None})

    employee_ids = _unique_employee_ids(data.get("employee_ids"))
    if not employee_ids:
        frappe.throw("employee_ids zorunludur.")

    overtime_date = str(data.get("date") or "").strip()
    if not overtime_date:
        frappe.throw("date zorunludur.")

    hours = _as_float(data.get("hours"), 0)
    if hours <= 0:
        frappe.throw("hours sifirdan buyuk olmalidir.")

    reason = str(data.get("reason") or "").strip()

    batch_name = ""
    has_batch_doctype = frappe.db.exists("DocType", "Overtime Batch")
    has_batch_line = frappe.db.exists("DocType", "Overtime Batch Line")

    if has_batch_doctype and has_batch_line:
        batch_doc = frappe.get_doc(
            {
                "doctype": "Overtime Batch",
                "batch_date": overtime_date,
                "hours": hours,
                "reason": reason,
                "created_by": frappe.session.user,
                "status": "Draft",
                "total_employees": len(employee_ids),
            }
        ).insert(ignore_permissions=True, ignore_mandatory=True)
        batch_name = batch_doc.name

    created_requests = []
    skipped_employees = []
    failed_rows = []

    for employee_id in employee_ids:
        if not frappe.db.exists("Employee", employee_id):
            skipped_employees.append(employee_id)
            if batch_name:
                frappe.get_doc(
                    {
                        "doctype": "Overtime Batch Line",
                        "parent": batch_name,
                        "parenttype": "Overtime Batch",
                        "parentfield": "lines",
                        "employee": employee_id,
                        "line_status": "Skipped",
                        "message": "Employee bulunamadi.",
                    }
                ).insert(ignore_permissions=True, ignore_mandatory=True)
            continue

        try:
            payload = {
                "doctype": "Overtime Request",
                "employee": employee_id,
                "date": overtime_date,
                "hours": hours,
                "reason": reason,
                "status": "Open",
            }
            if batch_name and _meta_has_field("Overtime Request", "overtime_batch"):
                payload["overtime_batch"] = batch_name

            created = frappe.get_doc(payload).insert(ignore_permissions=True, ignore_mandatory=True)
            created_requests.append(created.name)

            if batch_name:
                frappe.get_doc(
                    {
                        "doctype": "Overtime Batch Line",
                        "parent": batch_name,
                        "parenttype": "Overtime Batch",
                        "parentfield": "lines",
                        "employee": employee_id,
                        "request_ref": created.name,
                        "line_status": "Created",
                    }
                ).insert(ignore_permissions=True, ignore_mandatory=True)
        except Exception as error:
            message = str(error)
            failed_rows.append({"employee": employee_id, "message": message})
            if batch_name:
                frappe.get_doc(
                    {
                        "doctype": "Overtime Batch Line",
                        "parent": batch_name,
                        "parenttype": "Overtime Batch",
                        "parentfield": "lines",
                        "employee": employee_id,
                        "line_status": "Failed",
                        "message": message,
                    }
                ).insert(ignore_permissions=True, ignore_mandatory=True)

    if batch_name:
        batch_status = "Completed"
        if failed_rows and created_requests:
            batch_status = "Partial"
        elif failed_rows and not created_requests:
            batch_status = "Failed"

        batch_doc = frappe.get_doc("Overtime Batch", batch_name)
        batch_doc.status = batch_status
        batch_doc.success_count = len(created_requests)
        batch_doc.failed_count = len(failed_rows)
        batch_doc.total_employees = len(employee_ids)
        batch_doc.save(ignore_permissions=True)

    frappe.db.commit()

    return {
        "ok": len(failed_rows) == 0,
        "batch": batch_name,
        "total": len(employee_ids),
        "created_count": len(created_requests),
        "skipped_count": len(skipped_employees),
        "failed_count": len(failed_rows),
        "created_requests": created_requests,
        "skipped_employees": skipped_employees,
        "failed_rows": failed_rows,
    }


@frappe.whitelist()
def list_overtime_approval_queue(status="Open", employee=None, start_date=None, end_date=None, search_text=None, limit=500):
    return list_overtime_requests(
        employee=employee,
        status=status,
        start_date=start_date,
        end_date=end_date,
        search_text=search_text,
        limit=limit,
    )


def _update_overtime_request_state(request_id, status, rejection_reason=None):
    if not frappe.db.exists("Overtime Request", request_id):
        return {"name": request_id, "reason": "not_found"}

    doc = frappe.get_doc("Overtime Request", request_id)
    if _meta_has_field("Overtime Request", "status"):
        doc.status = status
    if _meta_has_field("Overtime Request", "workflow_state"):
        doc.workflow_state = status
    if _meta_has_field("Overtime Request", "approved_by"):
        doc.approved_by = frappe.session.user if status == "Approved" else None
    if _meta_has_field("Overtime Request", "approved_at"):
        doc.approved_at = now_datetime() if status == "Approved" else None
    if _meta_has_field("Overtime Request", "rejection_reason"):
        doc.rejection_reason = rejection_reason if status == "Rejected" else None

    doc.save(ignore_permissions=True)
    return {"name": request_id, "updated": True}


def _parse_request_ids(payload=None, **kwargs):
    data = _parse_payload(payload)
    if kwargs:
        data.update({key: value for key, value in kwargs.items() if value is not None})
    raw_ids = data.get("request_ids")
    if not isinstance(raw_ids, (list, tuple, set)):
        return [], data
    ids = []
    seen = set()
    for row in raw_ids:
        value = str(row or "").strip()
        if not value or value in seen:
            continue
        seen.add(value)
        ids.append(value)
    return ids, data


def _apply_bulk_state(status, payload=None, **kwargs):
    request_ids, data = _parse_request_ids(payload=payload, **kwargs)
    if not request_ids:
        frappe.throw("request_ids zorunludur.")

    rejection_reason = str(data.get("rejection_reason") or "").strip()

    updated = []
    skipped = []
    for request_id in request_ids:
        try:
            result = _update_overtime_request_state(request_id, status, rejection_reason=rejection_reason)
            if result.get("updated"):
                updated.append(request_id)
            else:
                skipped.append({"name": request_id, "reason": result.get("reason") or "skipped"})
        except Exception as error:
            skipped.append({"name": request_id, "reason": str(error)})

    frappe.db.commit()
    return {"ok": len(updated) > 0, "updated_count": len(updated), "updated": updated, "skipped": skipped}


@frappe.whitelist()
def approve_overtime_requests(payload=None, **kwargs):
    return _apply_bulk_state("Approved", payload=payload, **kwargs)


@frappe.whitelist()
def reject_overtime_requests(payload=None, **kwargs):
    return _apply_bulk_state("Rejected", payload=payload, **kwargs)
