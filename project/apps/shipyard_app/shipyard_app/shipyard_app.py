"""Compatibility shim for bench app import resolution.

Bench expects `shipyard_app.shipyard_app` to exist while syncing the app.
Keeping this module in place allows installs on additional sites without
changing the package layout used by the existing codebase.
"""

