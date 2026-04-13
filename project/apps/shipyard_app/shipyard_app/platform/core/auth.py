import frappe


def get_auth_context():
    user = frappe.session.user or "Guest"
    roles = frappe.get_roles(user) if user else []
    return {
        "user": user,
        "roles": sorted(set(roles)),
        "is_system_manager": "System Manager" in set(roles),
        "is_guest": user == "Guest",
    }

