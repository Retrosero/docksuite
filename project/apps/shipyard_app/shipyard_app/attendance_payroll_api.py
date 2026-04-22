import json
from datetime import datetime, timedelta

import frappe


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


def _as_int(value, default=0):
    try:
        return int(value)
    except Exception:
        return int(default)


def _as_float(value, default=0.0):
    try:
        return float(value)
    except Exception:
        return float(default)


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


def _normalize_time_text(value):
    text = str(value or "").strip()
    if not text:
        return ""

    if len(text) == 5:
        return f"{text}:00"
    return text


def _combine_date_and_time(attendance_date, time_value):
    time_text = _normalize_time_text(time_value)
    if not time_text:
        return None

    return f"{attendance_date} {time_text}"


def _normalize_datetime_pair(attendance_date, in_time, out_time):
    in_datetime_text = _combine_date_and_time(attendance_date, in_time)
    out_datetime_text = _combine_date_and_time(attendance_date, out_time)

    if not in_datetime_text and not out_datetime_text:
        return None, None

    if in_datetime_text and out_datetime_text:
        in_dt = datetime.fromisoformat(in_datetime_text)
        out_dt = datetime.fromisoformat(out_datetime_text)
        if out_dt < in_dt:
            out_dt = out_dt + timedelta(days=1)
        return in_dt.strftime("%Y-%m-%d %H:%M:%S"), out_dt.strftime("%Y-%m-%d %H:%M:%S")

    return in_datetime_text, out_datetime_text


def _resolve_employee_monthly_base_salary(employee_id):
    employee_row = frappe.db.get_value(
        "Employee",
        employee_id,
        ["shipyard_monthly_base_salary", "employee_name"],
        as_dict=True,
    )
    if employee_row and _as_float(employee_row.get("shipyard_monthly_base_salary"), 0) > 0:
        return {
            "base_salary": _as_float(employee_row.get("shipyard_monthly_base_salary"), 0),
            "employee_name": employee_row.get("employee_name") or employee_id,
            "source": "Employee.shipyard_monthly_base_salary",
        }

    assignment_rows = frappe.get_all(
        "Salary Structure Assignment",
        filters={"employee": employee_id, "docstatus": 1},
        fields=["base", "employee_name", "from_date"],
        order_by="from_date desc",
        limit_page_length=1,
        ignore_permissions=True,
    )
    assignment = assignment_rows[0] if assignment_rows else {}
    return {
        "base_salary": _as_float(assignment.get("base"), 0),
        "employee_name": assignment.get("employee_name") or (employee_row or {}).get("employee_name") or employee_id,
        "source": "Salary Structure Assignment.base" if assignment else "not_found",
    }


def _resolve_standard_monthly_hours():
    value = frappe.db.get_single_value("Tenant Settings", "shipyard_payroll_standard_monthly_hours")
    hours = _as_float(value, 225)
    if hours < 120:
        return 120
    if hours > 400:
        return 400
    return hours


def _round2(value):
    return round(_as_float(value, 0), 2)


@frappe.whitelist()
def bulk_upsert_attendance_times(payload=None, **kwargs):
    data = _parse_payload(payload)
    if kwargs:
        data.update({key: value for key, value in kwargs.items() if value is not None})

    employee_ids = _unique_employee_ids(data.get("employee_ids"))
    if not employee_ids:
        frappe.throw("employee_ids zorunludur.")

    attendance_date = str(data.get("attendance_date") or "").strip()
    if not attendance_date:
        frappe.throw("attendance_date zorunludur.")

    in_time = str(data.get("in_time") or "").strip()
    out_time = str(data.get("out_time") or "").strip()
    if not in_time and not out_time:
        frappe.throw("in_time veya out_time zorunludur.")

    shift = str(data.get("shift") or "").strip()
    status = str(data.get("status") or "").strip() or "Present"

    in_datetime_text, out_datetime_text = _normalize_datetime_pair(attendance_date, in_time, out_time)
    created = []
    updated = []
    failed = []
    skipped = []

    for employee_id in employee_ids:
        if not frappe.db.exists("Employee", employee_id):
            skipped.append({"employee": employee_id, "reason": "Employee bulunamadi."})
            continue

        existing_name = frappe.db.get_value(
            "Attendance",
            {"employee": employee_id, "attendance_date": attendance_date, "docstatus": ["!=", 2]},
            "name",
        )

        try:
            if existing_name:
                doc = frappe.get_doc("Attendance", existing_name)
                if in_datetime_text:
                    doc.in_time = in_datetime_text
                if out_datetime_text:
                    doc.out_time = out_datetime_text
                if shift:
                    doc.shift = shift
                if not doc.status:
                    doc.status = status
                doc.save(ignore_permissions=True)
                updated.append(existing_name)
                continue

            payload = {
                "doctype": "Attendance",
                "employee": employee_id,
                "attendance_date": attendance_date,
                "status": status,
            }
            if shift:
                payload["shift"] = shift
            if in_datetime_text:
                payload["in_time"] = in_datetime_text
            if out_datetime_text:
                payload["out_time"] = out_datetime_text

            doc = frappe.get_doc(payload).insert(ignore_permissions=True)
            created.append(doc.name)
        except Exception as error:
            failed.append({"employee": employee_id, "message": str(error)})

    frappe.db.commit()
    return {
        "ok": len(failed) == 0,
        "attendance_date": attendance_date,
        "total": len(employee_ids),
        "created_count": len(created),
        "updated_count": len(updated),
        "failed_count": len(failed),
        "skipped_count": len(skipped),
        "created": created,
        "updated": updated,
        "failed": failed,
        "skipped": skipped,
    }


@frappe.whitelist()
def get_monthly_attendance_payroll_preview(year=None, month=None, employee_ids=None, payload=None, **kwargs):
    data = _parse_payload(payload)
    if kwargs:
        data.update({key: value for key, value in kwargs.items() if value is not None})

    safe_year = _as_int(data.get("year", year), 0)
    safe_month = _as_int(data.get("month", month), 0)

    if safe_year < 2000 or safe_month < 1 or safe_month > 12:
        frappe.throw("year ve month gecerli olmalidir.")

    raw_employee_ids = data.get("employee_ids", employee_ids)
    if isinstance(raw_employee_ids, str):
        employee_ids = [row.strip() for row in raw_employee_ids.split(",") if row.strip()]
    elif isinstance(raw_employee_ids, (list, tuple, set)):
        employee_ids = list(raw_employee_ids)
    else:
        employee_ids = []

    employee_id_list = _unique_employee_ids(employee_ids or [])

    if not employee_id_list:
        active_employees = frappe.get_all(
            "Employee",
            filters={"status": ["!=", "Left"]},
            fields=["name"],
            order_by="employee_name asc",
            limit_page_length=500,
            ignore_permissions=True,
        )
        employee_id_list = [row.get("name") for row in active_employees if row.get("name")]

    start_date = f"{safe_year}-{safe_month:02d}-01"
    if safe_month == 12:
        end_date = f"{safe_year + 1}-01-01"
    else:
        end_date = f"{safe_year}-{safe_month + 1:02d}-01"

    standard_monthly_hours = _resolve_standard_monthly_hours()
    overtime_multiplier = 1.5
    rows = []

    for employee_id in employee_id_list:
        if not frappe.db.exists("Employee", employee_id):
            continue

        salary_info = _resolve_employee_monthly_base_salary(employee_id)
        attendance_rows = frappe.get_all(
            "Attendance",
            filters=[
                ["employee", "=", employee_id],
                ["attendance_date", ">=", start_date],
                ["attendance_date", "<", end_date],
                ["docstatus", "!=", 2],
            ],
            fields=["name", "attendance_date", "status", "in_time", "out_time"],
            order_by="attendance_date asc",
            limit_page_length=1000,
            ignore_permissions=True,
        )

        total_hours = 0.0
        attendance_days = 0
        for row in attendance_rows:
            in_time_value = row.get("in_time")
            out_time_value = row.get("out_time")
            if in_time_value and out_time_value:
                in_dt = frappe.utils.get_datetime(in_time_value)
                out_dt = frappe.utils.get_datetime(out_time_value)
                if out_dt >= in_dt:
                    duration = (out_dt - in_dt).total_seconds() / 3600
                    total_hours += max(duration, 0)
            status = str(row.get("status") or "").strip().lower()
            if status in ("present", "half day", "on leave", "absent"):
                attendance_days += 1

        base_salary = _as_float(salary_info.get("base_salary"), 0)
        hourly_rate = base_salary / standard_monthly_hours if standard_monthly_hours > 0 else 0
        overtime_hours = max(0.0, total_hours - standard_monthly_hours)
        overtime_pay = overtime_hours * hourly_rate * overtime_multiplier
        estimated_total_earnings = base_salary + overtime_pay

        rows.append(
            {
                "employee": employee_id,
                "employee_name": salary_info.get("employee_name") or employee_id,
                "salary_source": salary_info.get("source"),
                "attendance_days": attendance_days,
                "total_hours": _round2(total_hours),
                "standard_hours": _round2(standard_monthly_hours),
                "overtime_hours": _round2(overtime_hours),
                "hourly_rate": _round2(hourly_rate),
                "overtime_multiplier": overtime_multiplier,
                "overtime_pay": _round2(overtime_pay),
                "base_salary": _round2(base_salary),
                "estimated_total_earnings": _round2(estimated_total_earnings),
            }
        )

    totals = {
        "employee_count": len(rows),
        "total_hours": _round2(sum(_as_float(row.get("total_hours"), 0) for row in rows)),
        "overtime_hours": _round2(sum(_as_float(row.get("overtime_hours"), 0) for row in rows)),
        "overtime_pay": _round2(sum(_as_float(row.get("overtime_pay"), 0) for row in rows)),
        "estimated_total_earnings": _round2(
            sum(_as_float(row.get("estimated_total_earnings"), 0) for row in rows)
        ),
    }

    return {
        "year": safe_year,
        "month": safe_month,
        "period_start": start_date,
        "period_end_exclusive": end_date,
        "standard_monthly_hours": _round2(standard_monthly_hours),
        "rows": rows,
        "totals": totals,
    }
