import json

from shipyard_app import stabilization


def write_platform_log(
    message,
    *,
    category="platform",
    severity="Info",
    details=None,
    reference_doctype=None,
    reference_name=None,
):
    payload = details
    if isinstance(details, (dict, list)):
        payload = json.dumps(details, ensure_ascii=False)
    return stabilization.write_system_log(
        severity,
        message,
        category=category,
        details=payload,
        reference_doctype=reference_doctype,
        reference_name=reference_name,
    )

