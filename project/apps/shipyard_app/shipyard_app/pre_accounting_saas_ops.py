import frappe
from frappe import _
from frappe.utils import now_datetime, nowtime, get_datetime, get_datetime_str


def _require_system_manager():
    if "System Manager" not in frappe.get_roles(frappe.session.user):
        frappe.throw(_("Bu işlem için Sistem Yöneticisi yetkisi gerekli."), frappe.PermissionError)


PLANS = {
    "Starter": {
        "max_users": 5,
        "max_transactions_per_month": 1000,
        "max_storage_gb": 1,
        "features": ["Temel muhasebe", "Sınırlı raporlama", "Email destek"],
    },
    "Pro": {
        "max_users": 25,
        "max_transactions_per_month": 10000,
        "max_storage_gb": 10,
        "features": ["Tam muhasebe", "Gelişmiş raporlama", "API erişimi", "Öncelikli destek"],
    },
    "Enterprise": {
        "max_users": -1,
        "max_transactions_per_month": -1,
        "max_storage_gb": -1,
        "features": ["Sınırsız kullanıcı", "Sınırsız işlem", "Özel entegrasyonlar", "7/24 destek"],
    },
}


def get_subscription_info(subscription_name: str) -> dict:
    _require_system_manager()
    
    if not frappe.db.exists("Subscription", subscription_name):
        frappe.throw(_("Abonelik bulunamadı."), frappe.DoesNotExistError)
    
    sub = frappe.get_doc("Subscription", subscription_name)
    plan = sub.get("plan") or "Starter"
    plan_limits = PLANS.get(plan, PLANS["Starter"])
    
    current_users = frappe.db.count("User", {"enabled": 1})
    current_transactions = _get_monthly_transaction_count(sub.get("tenant_id"))
    current_storage = _get_storage_usage(sub.get("tenant_id"))
    
    return {
        "subscription_name": subscription_name,
        "tenant_id": sub.get("tenant_id"),
        "plan": plan,
        "status": sub.get("status"),
        "current_period_start": sub.get("current_period_start"),
        "current_period_end": sub.get("current_period_end"),
        "limits": {
            "max_users": plan_limits["max_users"],
            "max_transactions": plan_limits["max_transactions_per_month"],
            "max_storage_gb": plan_limits["max_storage_gb"],
        },
        "usage": {
            "users": current_users,
            "transactions": current_transactions,
            "storage_gb": round(current_storage, 2),
        },
        "features": plan_limits["features"],
    }


def update_subscription_plan(subscription_name: str, new_plan: str) -> dict:
    _require_system_manager()
    
    if new_plan not in PLANS:
        frappe.throw(_("Geçersiz plan. Geçerli planlar: {0}").format(", ".join(PLANS.keys())), frappe.ValidationError)
    
    if not frappe.db.exists("Subscription", subscription_name):
        frappe.throw(_("Abonelik bulunamadı."), frappe.DoesNotExistError)
    
    frappe.db.set_value("Subscription", subscription_name, "plan", new_plan)
    frappe.db.commit()
    
    return {
        "subscription_name": subscription_name,
        "new_plan": new_plan,
        "updated_at": now_datetime_str(),
    }


def check_usage_limits(tenant_id: str) -> dict:
    if not frappe.db.exists("Subscription", {"tenant_id": tenant_id}):
        return {"has_subscription": False}
    
    sub = frappe.db.get_value("Subscription", {"tenant_id": tenant_id}, ["name", "plan"], as_dict=1)
    if not sub:
        return {"has_subscription": False}
    
    plan_limits = PLANS.get(sub.plan, PLANS["Starter"])
    current_users = frappe.db.count("User", {"enabled": 1})
    current_transactions = _get_monthly_transaction_count(tenant_id)
    
    return {
        "has_subscription": True,
        "plan": sub.plan,
        "limits": {
            "users": {"limit": plan_limits["max_users"], "current": current_users},
            "transactions": {"limit": plan_limits["max_transactions_per_month"], "current": current_transactions},
        },
        "within_limits": _is_within_limits(plan_limits, current_users, current_transactions),
    }


def _is_within_limits(limits: dict, users: int, transactions: int) -> bool:
    if limits["max_users"] > 0 and users > limits["max_users"]:
        return False
    if limits["max_transactions_per_month"] > 0 and transactions > limits["max_transactions_per_month"]:
        return False
    return True


def _get_monthly_transaction_count(tenant_id: str) -> int:
    from dateutil.relativedelta import relativedelta
    
    period_start = get_datetime(now_datetime()).replace(day=1, hour=0, minute=0, second=0)
    
    count = frappe.db.sql("""
        SELECT COUNT(*) as cnt
        FROM `tabSales Invoice`
        WHERE tenant_id = %s
        AND posting_date >= %s
    """, (tenant_id, period_start.date()))[0][0] or 0
    
    return count


def _get_storage_usage(tenant_id: str) -> float:
    return 0.0


def run_tenant_health_check(tenant_id: str) -> dict:
    _require_system_manager()
    
    checks = []
    checks.append(_check_database_connection())
    checks.append(_check_api_responsiveness())
    checks.append(_check_active_users(tenant_id))
    checks.append(_check_recent_transactions(tenant_id))
    
    total = len(checks)
    passed = sum(1 for c in checks if c["status"] == "healthy")
    
    return {
        "tenant_id": tenant_id,
        "checked_at": now_datetime_str(),
        "total_checks": total,
        "passed_checks": passed,
        "failed_checks": total - passed,
        "overall_status": "healthy" if passed == total else "degraded",
        "checks": checks,
    }


def _check_database_connection() -> dict:
    import time
    
    try:
        start = time.time()
        frappe.db.sql("SELECT 1")
        response_time_ms = round((time.time() - start) * 1000, 2)
        
        return {
            "check_name": "Veritabanı Bağlantısı",
            "status": "healthy",
            "response_time_ms": response_time_ms,
        }
    except Exception as e:
        return {
            "check_name": "Veritabanı Bağlantısı",
            "status": "unhealthy",
            "error": str(e),
        }


def _check_api_responsiveness() -> dict:
    import time
    
    try:
        start = time.time()
        frappe.call("frappe.ping")
        response_time_ms = round((time.time() - start) * 1000, 2)
        
        return {
            "check_name": "API Yanıt Süresi",
            "status": "healthy" if response_time_ms < 500 else "degraded",
            "response_time_ms": response_time_ms,
        }
    except Exception as e:
        return {
            "check_name": "API Yanıt Süresi",
            "status": "unhealthy",
            "error": str(e),
        }


def _check_active_users(tenant_id: str) -> dict:
    active_users = frappe.db.sql("""
        SELECT COUNT(DISTINCT user)
        FROM `tabActivity Log`
        WHERE tenant_id = %s
        AND creation >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    """, (tenant_id,))[0][0] or 0
    
    return {
        "check_name": "Aktif Kullanıcılar (24s)",
        "status": "healthy",
        "active_users_24h": active_users,
    }


def _check_recent_transactions(tenant_id: str) -> dict:
    recent_count = frappe.db.sql("""
        SELECT COUNT(*)
        FROM `tabSales Invoice`
        WHERE tenant_id = %s
        AND creation >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    """, (tenant_id,))[0][0] or 0
    
    return {
        "check_name": "Son İşlemler (1s)",
        "status": "healthy",
        "transactions_last_hour": recent_count,
    }


def now_datetime_str() -> str:
    return get_datetime_str(now_datetime())


def get_diagnostic_logs(tenant_id: str, log_type: str = "error", limit: int = 50) -> dict:
    _require_system_manager()
    
    if log_type not in ["error", "warning", "info"]:
        frappe.throw(_("Geçersiz log türü."), frappe.ValidationError)
    
    logs = frappe.get_all(
        "Log Settings",
        filters={
            "tenant_id": tenant_id,
        },
        fields=["name", "level", "message", "creation"],
        order_by="creation desc",
        limit=limit,
    )
    
    return {
        "tenant_id": tenant_id,
        "log_type": log_type,
        "count": len(logs),
        "logs": logs,
    }
