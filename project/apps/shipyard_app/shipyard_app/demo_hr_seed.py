import calendar
from datetime import date, timedelta

import frappe

from shipyard_app import tenant_onboarding


DEMO_EMPLOYEES = [
    {
        "first_name": "Ahmet",
        "last_name": "Yilmaz",
        "gender": "Male",
        "department": "Uretim",
        "designation": "Kaynakci",
        "base_salary": 32000,
    },
    {
        "first_name": "Mehmet",
        "last_name": "Kaya",
        "gender": "Male",
        "department": "Uretim",
        "designation": "Boru Ustasi",
        "base_salary": 33500,
    },
    {
        "first_name": "Ayse",
        "last_name": "Demir",
        "gender": "Female",
        "department": "Muhendislik",
        "designation": "Makine Muhendisi",
        "base_salary": 42000,
    },
    {
        "first_name": "Fatma",
        "last_name": "Sahin",
        "gender": "Female",
        "department": "Muhendislik",
        "designation": "Planlama Muhendisi",
        "base_salary": 41000,
    },
    {
        "first_name": "Can",
        "last_name": "Acar",
        "gender": "Male",
        "department": "Depo",
        "designation": "Depo Sorumlusu",
        "base_salary": 30000,
    },
    {
        "first_name": "Zeynep",
        "last_name": "Arslan",
        "gender": "Female",
        "department": "Insan Kaynaklari",
        "designation": "IK Uzmani",
        "base_salary": 36000,
    },
    {
        "first_name": "Emre",
        "last_name": "Koc",
        "gender": "Male",
        "department": "Vardiya",
        "designation": "Formen",
        "base_salary": 39000,
    },
    {
        "first_name": "Selin",
        "last_name": "Polat",
        "gender": "Female",
        "department": "Kalite",
        "designation": "Kalite Kontrol Uzmani",
        "base_salary": 35500,
    },
    {
        "first_name": "Murat",
        "last_name": "Tas",
        "gender": "Male",
        "department": "Bakim",
        "designation": "Bakim Teknisyeni",
        "base_salary": 34000,
    },
    {
        "first_name": "Elif",
        "last_name": "Cetin",
        "gender": "Female",
        "department": "Satin Alma",
        "designation": "Satin Alma Uzmani",
        "base_salary": 35000,
    },
]

DEFAULT_SHIFT_TYPES = [
    {"name": "Gunduz", "start_time": "08:00:00", "end_time": "16:00:00"},
    {"name": "Aksam", "start_time": "16:00:00", "end_time": "00:00:00"},
    {"name": "Gece", "start_time": "00:00:00", "end_time": "08:00:00"},
]


def _month_bounds(year, month):
    _, last_day = calendar.monthrange(year, month)
    start = date(year, month, 1)
    end = date(year, month, last_day)
    return start, end


def _ensure_company():
    company = frappe.db.get_value("Company", {}, "name")
    if not company:
        frappe.throw("Company bulunamadi. Once ERPNext company kaydi olusturulmalidir.")
    return company


def _ensure_department(name, company):
    existing = frappe.db.get_value(
        "Department", {"department_name": name, "company": company}, "name"
    )
    if existing:
        return existing

    doc = frappe.get_doc(
        {
            "doctype": "Department",
            "department_name": name,
            "company": company,
        }
    )
    doc.insert(ignore_permissions=True, ignore_mandatory=True)
    return doc.name


def _ensure_designation(name):
    existing = frappe.db.get_value("Designation", {"designation_name": name}, "name")
    if existing:
        return existing

    doc = frappe.get_doc(
        {
            "doctype": "Designation",
            "designation_name": name,
        }
    )
    doc.insert(ignore_permissions=True, ignore_mandatory=True)
    return doc.name


def _ensure_leave_type(name):
    if frappe.db.exists("Leave Type", name):
        return name

    doc = frappe.get_doc(
        {
            "doctype": "Leave Type",
            "leave_type_name": name,
            "max_leaves_allowed": 30,
            "is_lwp": 0,
            "is_carry_forward": 1,
        }
    )
    doc.insert(ignore_permissions=True, ignore_mandatory=True)
    return doc.name


def _ensure_employee(person, company):
    employee_name = f"{person['first_name']} {person['last_name']}"
    existing = frappe.db.get_value("Employee", {"employee_name": employee_name}, "name")
    if existing:
        return existing, False

    doc = frappe.get_doc(
        {
            "doctype": "Employee",
            "first_name": person["first_name"],
            "last_name": person["last_name"],
            "employee_name": employee_name,
            "company": company,
            "status": "Active",
            "gender": person["gender"],
            "department": person["department"],
            "designation": person["designation"],
            "date_of_joining": "2024-01-01",
            "personal_email": f"{person['first_name'].lower()}.{person['last_name'].lower()}@ornek-tersane.demo",
            "cell_number": f"+90530000{100 + DEMO_EMPLOYEES.index(person):03d}",
        }
    )
    doc.insert(ignore_permissions=True, ignore_mandatory=True, ignore_links=True)
    return doc.name, True


def _ensure_overtime_request(employee, overtime_date, hours, reason):
    if not frappe.db.exists("DocType", "Overtime Request"):
        tenant_onboarding.ensure_overtime_request_doctype()

    exists = frappe.db.exists(
        "Overtime Request",
        {
            "employee": employee,
            "date": str(overtime_date),
            "reason": reason,
        },
    )
    if exists:
        return False

    doc = frappe.get_doc(
        {
            "doctype": "Overtime Request",
            "employee": employee,
            "date": str(overtime_date),
            "hours": hours,
            "reason": reason,
            "status": "Approved",
        }
    )
    doc.insert(ignore_permissions=True, ignore_mandatory=True, ignore_links=True)
    return True


def _ensure_leave_application(employee, leave_type, company, leave_day):
    exists = frappe.db.exists(
        "Leave Application",
        {
            "employee": employee,
            "leave_type": leave_type,
            "from_date": str(leave_day),
            "to_date": str(leave_day),
        },
    )
    if exists:
        return False

    doc = frappe.get_doc(
        {
            "doctype": "Leave Application",
            "employee": employee,
            "company": company,
            "leave_type": leave_type,
            "from_date": str(leave_day),
            "to_date": str(leave_day),
            "posting_date": str(leave_day),
            "status": "Approved",
            "description": "Demo aylik izin kaydi",
        }
    )
    doc.flags.ignore_validate = True
    doc.insert(ignore_permissions=True, ignore_mandatory=True, ignore_links=True)
    return True


def _ensure_salary_slip(employee, company, start_date, end_date, base_salary, overtime_payment):
    exists = frappe.db.exists(
        "Salary Slip",
        {
            "employee": employee,
            "start_date": str(start_date),
            "end_date": str(end_date),
        },
    )
    if exists:
        return False

    gross_pay = float(base_salary) + float(overtime_payment)
    doc = frappe.get_doc(
        {
            "doctype": "Salary Slip",
            "employee": employee,
            "company": company,
            "posting_date": str(end_date),
            "start_date": str(start_date),
            "end_date": str(end_date),
            "payroll_frequency": "Monthly",
            "gross_pay": gross_pay,
            "net_pay": gross_pay,
            "rounded_total": gross_pay,
            "total_working_days": 30,
            "payment_days": 30,
            "earnings": [
                {"salary_component": "Temel Maas", "amount": float(base_salary)},
                {"salary_component": "Mesai Odemesi", "amount": float(overtime_payment)},
            ],
        }
    )
    doc.flags.ignore_validate = True
    doc.insert(ignore_permissions=True, ignore_mandatory=True, ignore_links=True)
    return True


def _ensure_salary_component(name):
    if frappe.db.exists("Salary Component", name):
        return name

    doc = frappe.get_doc(
        {
            "doctype": "Salary Component",
            "salary_component": name,
            "type": "Earning",
        }
    )
    doc.insert(ignore_permissions=True, ignore_mandatory=True)
    return doc.name


def _ensure_shift_type(name, start_time, end_time):
    existing = frappe.db.get_value("Shift Type", {"name": name}, "name")
    if existing:
        return existing

    has_shift_type_name = frappe.db.has_column("Shift Type", "shift_type_name")
    if has_shift_type_name:
        existing = frappe.db.get_value("Shift Type", {"shift_type_name": name}, "name")
        if existing:
            return existing

    doc = frappe.get_doc(
        {
            "doctype": "Shift Type",
            **({"shift_type_name": name} if has_shift_type_name else {"name": name}),
            "start_time": start_time,
            "end_time": end_time,
        }
    )
    doc.insert(ignore_permissions=True, ignore_mandatory=True, ignore_links=True)
    return doc.name


def _ensure_shift_types():
    shift_types = frappe.get_all(
        "Shift Type",
        fields=["name"],
        order_by="name asc",
        limit_page_length=200,
    )
    if shift_types:
        resolved = []
        seen = set()
        for row in shift_types:
            name = row.get("name")
            if not name or name in seen:
                continue
            seen.add(name)
            resolved.append(name)
        return resolved

    created = []
    for row in DEFAULT_SHIFT_TYPES:
        created.append(_ensure_shift_type(row["name"], row["start_time"], row["end_time"]))
    return created


def _ensure_shift_assignment(employee, shift_type, assignment_date):
    assignment_date_value = str(assignment_date)
    exists = frappe.db.exists(
        "Shift Assignment",
        {
            "employee": employee,
            "shift_type": shift_type,
            "start_date": assignment_date_value,
            "end_date": assignment_date_value,
        },
    )
    if exists:
        return False

    doc = frappe.get_doc(
        {
            "doctype": "Shift Assignment",
            "employee": employee,
            "shift_type": shift_type,
            "start_date": assignment_date_value,
            "end_date": assignment_date_value,
            "status": "Active",
        }
    )
    doc.insert(ignore_permissions=True, ignore_mandatory=True, ignore_links=True)
    return True


def _ensure_demo_shift_assignments(employee_ids):
    if not employee_ids:
        return 0

    shift_types = _ensure_shift_types()
    if not shift_types:
        return 0

    created_count = 0
    today = frappe.utils.getdate()
    weekday_index = 0

    for day_offset in range(30):
        assignment_day = today + timedelta(days=day_offset)

        # Haftaiçi atama
        if assignment_day.weekday() > 4:
            continue

        for employee_index, employee_id in enumerate(employee_ids):
            shift_type = shift_types[(employee_index + weekday_index) % len(shift_types)]
            if _ensure_shift_assignment(
                employee=employee_id, shift_type=shift_type, assignment_date=assignment_day
            ):
                created_count += 1

        weekday_index += 1

    return created_count


@frappe.whitelist()
def seed_demo_hr_data(years=None, employee_count=10):
    """ERPNext uyumlu demo personel + bordro + mesai + izin verisi üretir.

    Varsayilan yillar: 2024, 2025, 2026
    """
    if years is None:
        years = [2024, 2025, 2026]

    years = sorted({int(year) for year in years})
    if not years:
        frappe.throw("En az bir yil verilmelidir.")

    company = _ensure_company()
    tenant_onboarding.ensure_gender_master_rows()
    _ensure_salary_component("Temel Maas")
    _ensure_salary_component("Mesai Odemesi")
    leave_type = _ensure_leave_type("Yillik Izin")

    people = DEMO_EMPLOYEES[: max(1, min(int(employee_count or 10), len(DEMO_EMPLOYEES)))]

    created = {
        "employees": 0,
        "overtime_requests": 0,
        "leave_applications": 0,
        "salary_slips": 0,
        "shift_assignments": 0,
    }
    used_employees = []

    for person in people:
        _ensure_department(person["department"], company)
        _ensure_designation(person["designation"])

        employee, is_created = _ensure_employee(person, company)
        used_employees.append(employee)
        if is_created:
            created["employees"] += 1

        for year in years:
            for month in range(1, 13):
                month_start, month_end = _month_bounds(year, month)

                overtime_hours = round(6 + ((month + DEMO_EMPLOYEES.index(person)) % 10) * 1.25, 2)
                overtime_payment = round(overtime_hours * 180, 2)
                leave_day = date(year, month, min(3 + (DEMO_EMPLOYEES.index(person) % 3), month_end.day))

                if _ensure_overtime_request(
                    employee=employee,
                    overtime_date=month_end,
                    hours=overtime_hours,
                    reason=f"{year}-{month:02d} aylik planli mesai",
                ):
                    created["overtime_requests"] += 1

                if _ensure_leave_application(
                    employee=employee,
                    leave_type=leave_type,
                    company=company,
                    leave_day=leave_day,
                ):
                    created["leave_applications"] += 1

                if _ensure_salary_slip(
                    employee=employee,
                    company=company,
                    start_date=month_start,
                    end_date=month_end,
                    base_salary=person["base_salary"],
                    overtime_payment=overtime_payment,
                ):
                    created["salary_slips"] += 1

    created["shift_assignments"] = _ensure_demo_shift_assignments(used_employees)

    frappe.db.commit()

    return {
        "site": frappe.local.site,
        "company": company,
        "years": years,
        "employee_count": len(used_employees),
        "employee_ids": used_employees,
        "created": created,
    }


@frappe.whitelist()
def get_demo_hr_data_counts():
    employee_ids = frappe.get_all(
        "Employee",
        filters={"personal_email": ["like", "%@ornek-tersane.demo"]},
        pluck="name",
    )
    employee_ids = employee_ids or []

    salary_filters = {
        "start_date": [">=", "2024-01-01"],
        "end_date": ["<=", "2026-12-31"],
    }
    if employee_ids:
        salary_filters["employee"] = ["in", employee_ids]

    shift_assignment_count = 0
    if employee_ids:
        shift_assignment_count = len(
            frappe.get_all(
                "Shift Assignment",
                filters=[["employee", "in", employee_ids]],
                fields=["name"],
                limit_page_length=100000,
            )
        )

    return {
        "site": frappe.local.site,
        "employees": len(employee_ids),
        "overtime_requests": frappe.db.count(
            "Overtime Request", {"reason": ["like", "%aylik planli mesai%"]}
        )
        if frappe.db.exists("DocType", "Overtime Request")
        else 0,
        "leave_applications": frappe.db.count(
            "Leave Application", {"description": "Demo aylik izin kaydi"}
        ),
        "salary_slips": frappe.db.count("Salary Slip", salary_filters),
        "shift_assignments": shift_assignment_count,
    }
