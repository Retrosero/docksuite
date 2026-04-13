from shipyard_app.platform.domains.base import DomainAdapter


class ShipyardDomainAdapter(DomainAdapter):
    key = "shipyard"
    display_name = "Shipyard"
    capabilities = {
        "vardiya": {
            "label": "Vardiya",
            "required_features": ["attendance"],
            "required_modules": ["hr"],
            "doctype_scope": ["Attendance", "Shift Type", "Team"],
        },
        "zimmet": {
            "label": "Zimmet",
            "required_features": ["zimmet"],
            "required_modules": [],
            "doctype_scope": ["Zimmet", "Item"],
        },
        "stok": {
            "label": "Stok",
            "required_features": ["material_request", "module.stock"],
            "required_modules": ["stock"],
            "doctype_scope": ["Item", "Material Request", "Stock Entry"],
        },
    }


def get_domain_adapter():
    return ShipyardDomainAdapter()

