import frappe


def main():
    frappe.init(site="shipyard.localhost", sites_path="/home/frappe/frappe-bench/sites")
    frappe.connect()
    try:
        import shipyard_app.tenant_onboarding as tenant_onboarding

        result = tenant_onboarding.create_tenant_site(
            site_name="tenant-smoke.localhost",
            admin_password="Admin123",
        )
        print(result)
    finally:
        frappe.destroy()


if __name__ == "__main__":
    main()
