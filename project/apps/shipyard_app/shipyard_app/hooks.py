app_name = "shipyard_app"
app_title = "Shipyard App"
app_publisher = "Shipyard Team"
app_description = "ERPNext Shipyard Operations App"
app_email = "team@shipyard.local"
app_license = "mit"

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
            ["name", "in", ["Team", "Zimmet", "Field Report", "Task Progress"]],
        ],
    }
]
