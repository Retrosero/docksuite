after_install = "shipyard_app.tenant_onboarding.bootstrap_shipyard_setup"
after_migrate = "shipyard_app.tenant_onboarding.bootstrap_shipyard_setup"

fixtures = [
    {
        "dt": "Custom Field",
        "filters": [
            ["name", "in", ["Item-shipyard_secondary_aisle"]],
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
                    "System Log Entry",
                    "Tenant Backup Request",
                    "Tenant Settings",
                ],
            ],
        ],
    },
]
