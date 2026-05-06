import frappe
frappe.init(site='docksuite.local')
frappe.connect()
exec(open('project/apps/shipyard_app/shipyard_app/pre_accounting_test_data.py').read())
result = seed_master_data()
print(result)
frappe.db.commit()