after_install = "shipyard_app.stabilization.bootstrap_system_stabilization"
after_migrate = "shipyard_app.stabilization.bootstrap_system_stabilization"

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
                ],
            ],
        ],
    },
]
