# Frappe Core Concepts

## Temel kavramlar
### DocType
Sistemde tutulan kayıt türüdür.

### Document
Bir DocType'ın tekil kaydıdır.

### Site
Frappe çok tenantlı çalışır.
Her tenant bir `site`tir.
Her site:
- kendi veritabanına,
- kendi site yapılandırmasına,
- kendi dosya alanına
sahiptir.

### App
Geliştirme paketidir.
Örnek:
- frappe
- erpnext
- hrms
- core_app
- shipyard_app
