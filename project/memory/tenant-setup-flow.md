# Tenant Setup Flow

## Date
- 2026-04-13

## Scope
- Tenant onboarding automation for new ERPNext sites.
- Default setup bootstrap for each tenant site.
- Branding and optional demo-data support.

## Implemented Flow
1. Create tenant site via `shipyard_app.tenant_onboarding.create_tenant_site`.
2. Create DB automatically with `bench new-site`.
3. Install apps automatically in sequence:
- `erpnext` (optional)
- `hrms` (optional)
- `shipyard_app` (mandatory)
4. Run onboarding bootstrap on new site:
- ensure `Tenant Settings` DocType (Single)
- ensure default shipyard roles
- ensure default tenant user
- apply base branding/system settings
- create optional demo records (Employee + Item)

## Current Bootstrap Hooks
- `after_install`: `shipyard_app.tenant_onboarding.bootstrap_shipyard_setup`
- `after_migrate`: `shipyard_app.tenant_onboarding.bootstrap_shipyard_setup`

## Tenant Settings Model
- Doctype: `Tenant Settings` (Single)
- Core fields:
- `tenant_site`
- `company_name`
- `tenant_display_name`
- `default_language`
- `default_timezone`
- `brand_logo`
- `primary_color`
- `secondary_color`
- `accent_color`
- `default_user_email`
- `default_user_first_name`
- `default_user_last_name`
- `create_demo_data`

## Default Roles
- Shipyard Worker
- Shipyard Foreman
- Shipyard Engineer
- Shipyard Manager
- Shipyard Storekeeper
- Shipyard HR

## API Surface
- `shipyard_app.tenant_onboarding.create_tenant_site`
- `shipyard_app.tenant_onboarding.run_current_site_default_setup`
- `shipyard_app.tenant_onboarding.bootstrap_tenant_defaults`

## Validation Additions
- `fixture_validation.validate_tenant_settings_setup`
- `fixture_validation.validate_tenant_onboarding_setup`

## Multi-tenant Notes
- No tenant/company hardcode in behavior.
- Per-tenant values are driven by settings payload.
- Site-level isolation remains unchanged (one site/db per tenant).
