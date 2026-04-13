#!/usr/bin/env bash
set -euo pipefail

cd /home/frappe/frappe-bench
bench --site shipyard.localhost execute shipyard_app.tenant_onboarding.create_tenant_site --kwargs '{"site_name":"tenant-smoke2.localhost","admin_password":"Admin123","with_demo_data":1,"company_name":"Tenant Smoke 2","tenant_display_name":"Tenant Smoke 2","primary_color":"#114488","secondary_color":"#22AA88","accent_color":"#FFAA00","mariadb_root_username":"root","mariadb_root_password":""}'
