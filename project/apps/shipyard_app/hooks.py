app_name = "shipyard_app"
app_title = "Shipyard App"
app_publisher = "Shipyard Team"
app_description = "ERPNext Shipyard Operations App"
app_email = "team@shipyard.local"
app_license = "mit"

after_install = "shipyard_app.tenant_onboarding.bootstrap_shipyard_setup"
after_migrate = "shipyard_app.tenant_onboarding.bootstrap_shipyard_setup"

fixtures = [
    {
        "dt": "Custom Field",
        "filters": [
            [
                "name",
                "in",
                [
                    "Item-shipyard_secondary_aisle",
                    "Employee-shipyard_monthly_base_salary",
                ],
            ],
        ],
    },
    {
        "dt": "DocType",
        "filters": [
            [
                "name",
                "in",
                [
                    "Team",
                    "Zimmet",
                    "Field Report",
                    "Task Progress",
                    "Technical Document Link",
                    "Overtime Request",
                    "System Log Entry",
                    "Tenant Backup Request",
                    "Tenant Settings",
                    "Tenant Registry",
                    "Support Note",
                    "Product Plan",
                    "Tenant Product Config",
                    "Tenant Feature Access",
                    "Tenant Usage Counter",
                    "Stock Alert Action Event",
                ],
            ],
        ],
    },
]
