import frappe
from frappe import _
from frappe.utils import getdate, now_datetime, date_diff, add_days
from frappe.utils.csvutils import read_csv_content


def _require_authenticated_user():
    if frappe.session.user == "Guest":
        frappe.throw(_("Bu işlem için oturum açmalısınız."), frappe.PermissionError)


def _require_report_access(report_type: str) -> None:
    user_roles = set(frappe.get_roles(frappe.session.user) or [])
    role_templates = frappe.db.get_value("User", frappe.session.user, "user_defaults") or ""
    
    REPORT_ACCESS = {
        "cash_flow": ["yonetici", "muhasebe_sorumlusu"],
        "aging_analysis": ["yonetici", "muhasebe_sorumlusu"],
        "collection_performance": ["yonetici", "muhasebe_sorumlusu", "satis_operasyon"],
        "profit_loss": ["yonetici"],
    }
    
    allowed = REPORT_ACCESS.get(report_type, [])
    if allowed and role_templates not in allowed:
        frappe.throw(_("Bu rapora erişim yetkiniz yok."), frappe.PermissionError)


def get_cash_flow_report(from_date: str, to_date: str) -> dict:
    _require_authenticated_user()
    _require_report_access("cash_flow")
    
    from_date = getdate(from_date)
    to_date = getdate(to_date)
    
    cash_in = _get_payment_entries(from_date, to_date, "Receive")
    cash_out = _get_payment_entries(from_date, to_date, "Pay")
    
    cash_in_total = sum(e.get("paid_amount", 0) for e in cash_in)
    cash_out_total = sum(e.get("paid_amount", 0) for e in cash_out)
    
    return {
        "from_date": from_date.strftime("%Y-%m-%d"),
        "to_date": to_date.strftime("%Y-%m-%d"),
        "cash_inflow": cash_in,
        "cash_inflow_total": cash_in_total,
        "cash_outflow": cash_out,
        "cash_outflow_total": cash_out_total,
        "net_flow": cash_in_total - cash_out_total,
    }


def _get_payment_entries(from_date, to_date, payment_type: str) -> list[dict]:
    entries = frappe.get_all(
        "Payment Entry",
        filters={
            "payment_type": payment_type,
            "posting_date": ["between", [from_date, to_date]],
            "docstatus": 1,
        },
        fields=["name", "party_name", "paid_amount", "posting_date", "reference_no"],
    )
    return entries


def get_aging_analysis(as_of_date: str | None = None) -> dict:
    _require_authenticated_user()
    _require_report_access("aging_analysis")
    
    as_of = getdate(as_of_date) if as_of_date else getdate(now_datetime())
    
    invoices = frappe.get_all(
        "Sales Invoice",
        filters={"docstatus": 1, "status": ["!=", "Paid"]},
        fields=["name", "customer_name", "outstanding_amount", "due_date", "posting_date"],
    )
    
    aging_buckets = {"current": [], "1_30": [], "31_60": [], "61_90": [], "over_90": []}
    total_outstanding = 0
    
    for inv in invoices:
        days_due = date_diff(as_of, inv.due_date)
        total_outstanding += inv.outstanding_amount
        
        if days_due <= 0:
            aging_buckets["current"].append(inv)
        elif days_due <= 30:
            aging_buckets["1_30"].append(inv)
        elif days_due <= 60:
            aging_buckets["31_60"].append(inv)
        elif days_due <= 90:
            aging_buckets["61_90"].append(inv)
        else:
            aging_buckets["over_90"].append(inv)
    
    return {
        "as_of_date": as_of.strftime("%Y-%m-%d"),
        "aging_buckets": aging_buckets,
        "total_outstanding": total_outstanding,
        "bucket_totals": {
            bucket: sum(i.get("outstanding_amount", 0) for i in items)
            for bucket, items in aging_buckets.items()
        },
    }


def get_collection_performance(from_date: str, to_date: str) -> dict:
    _require_authenticated_user()
    _require_report_access("collection_performance")
    
    from_date = getdate(from_date)
    to_date = getdate(to_date)
    
    collections = frappe.get_all(
        "Payment Entry",
        filters={
            "payment_type": "Receive",
            "posting_date": ["between", [from_date, to_date]],
            "docstatus": 1,
        },
        fields=["name", "party_name", "paid_amount", "posting_date"],
    )
    
    invoices = frappe.get_all(
        "Sales Invoice",
        filters={
            "posting_date": ["between", [from_date, to_date]],
            "docstatus": 1,
        },
        fields=["name", "customer_name", "grand_total"],
    )
    
    total_invoiced = sum(i.get("grand_total", 0) for i in invoices)
    total_collected = sum(c.get("paid_amount", 0) for c in collections)
    
    return {
        "from_date": from_date.strftime("%Y-%m-%d"),
        "to_date": to_date.strftime("%Y-%m-%d"),
        "total_invoiced": total_invoiced,
        "total_collected": total_collected,
        "collection_rate": (total_collected / total_invoiced * 100) if total_invoiced > 0 else 0,
        "collections": collections,
    }


def get_profit_loss_summary(from_date: str, to_date: str) -> dict:
    _require_authenticated_user()
    _require_report_access("profit_loss")
    
    from_date = getdate(from_date)
    to_date = getdate(to_date)
    
    sales = frappe.db.sql("""
        SELECT SUM(grand_total) as total_sales
        FROM `tabSales Invoice`
        WHERE docstatus = 1
        AND posting_date BETWEEN %s AND %s
    """, (from_date, to_date), as_dict=1)
    
    purchases = frappe.db.sql("""
        SELECT SUM(grand_total) as total_purchases
        FROM `tabPurchase Invoice`
        WHERE docstatus = 1
        AND posting_date BETWEEN %s AND %s
    """, (from_date, to_date), as_dict=1)
    
    expenses = frappe.db.sql("""
        SELECT SUM(amount) as total_expenses
        FROM `tabExpense Claim`
        WHERE docstatus = 1
        AND posting_date BETWEEN %s AND %s
    """, (from_date, to_date), as_dict=1)
    
    total_sales = sales[0].total_sales if sales else 0
    total_purchases = purchases[0].total_purchases if purchases else 0
    total_expenses = expenses[0].total_expenses if expenses else 0
    
    return {
        "from_date": from_date.strftime("%Y-%m-%d"),
        "to_date": to_date.strftime("%Y-%m-%d"),
        "total_sales": total_sales,
        "total_purchases": total_purchases,
        "total_expenses": total_expenses,
        "gross_profit": total_sales - total_purchases,
        "net_profit": total_sales - total_purchases - total_expenses,
    }


def export_report_to_csv(report_type: str, params: dict) -> dict:
    _require_authenticated_user()
    
    report_funcs = {
        "cash_flow": lambda: get_cash_flow_report(params.get("from_date"), params.get("to_date")),
        "aging_analysis": lambda: get_aging_analysis(params.get("as_of_date")),
        "collection_performance": lambda: get_collection_performance(params.get("from_date"), params.get("to_date")),
        "profit_loss": lambda: get_profit_loss_summary(params.get("from_date"), params.get("to_date")),
    }
    
    report_func = report_funcs.get(report_type)
    if not report_func:
        frappe.throw(_("Geçersiz rapor türü."), frappe.ValidationError)
    
    data = report_func()
    
    csv_content = _dict_to_csv(data)
    
    filename = f"{report_type}_{params.get('from_date', 'report')}.csv"
    
    return {
        "file_content": csv_content,
        "filename": filename,
        "content_type": "text/csv",
    }


def _dict_to_csv(data: dict) -> str:
    import csv
    from io import StringIO
    
    output = StringIO()
    writer = csv.writer(output)
    
    for key, value in data.items():
        if isinstance(value, (list, tuple)):
            writer.writerow([key])
            for item in value:
                if isinstance(item, dict):
                    writer.writerow(item.values())
                else:
                    writer.writerow([item])
        else:
            writer.writerow([key, value])
    
    return output.getvalue()
