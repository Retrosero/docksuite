# System Capabilities

## Stabilization Layer
- Tenant bazli loglama mevcut.
- Info, Warning, Error ayrimi uygulanir.
- Hata kayitlarinda tenant site, user, endpoint, method, status code ve traceback alanlari tutulur.
- Health check endpointi db ve redis kontrolu yapar.
- Manual backup istegi tenant bazli request kaydi olarak olusturulur.

## Current API Surface
- `shipyard_app.stabilization.log_info`
- `shipyard_app.stabilization.log_warning`
- `shipyard_app.stabilization.log_error`
- `shipyard_app.stabilization.health_check`
- `shipyard_app.stabilization.request_manual_backup`

## Storage Model
- Loglar custom DocType `System Log Entry` icinde tutulur.
- Backup talepleri custom DocType `Tenant Backup Request` icinde tutulur.
- Her site kendi veritabani ile ayridir; tenant ayrimi site seviyesinde dogal izolasyonla saglanir.

