# Architecture Platform (Prompt 11)

## Amac
- Sistemi sektorel genislemeye hazir hale getirmek icin platform katmani olusturuldu.
- Mimari iki ana bolume ayrildi: `core` ve `domain`.

## Core vs Domain Ayrimi

### Core
Konum: `shipyard_app/platform/core`

- `auth.py`: oturum kullanicisi ve rol baglami
- `tenant.py`: tenant (site) baglami
- `logging.py`: platform olaylarini merkezi log katmanina yazma
- `config.py`: platform/domain konfigurasyonlarini cozumleme

### Domain (Shipyard)
Konum: `shipyard_app/platform/domains/shipyard.py`

- `vardiya` capability
- `zimmet` capability
- `stok` capability

Her capability icin:
- gerekli feature flag listesi
- gerekli modul toggle listesi
- ilgili doctype kapsam listesi

## Domain Isolation Yapisi
- `shipyard_app/platform/registry.py` domain baglamini tenant bazli cozumler.
- Domain etkinligi su kurallarla belirlenir:
  - domain config `is_enabled`
  - domain-level `required_features`
  - capability-level `required_features`
  - capability-level `required_modules` (hr/stock)
- Sonuc, tenantin product profile bilgisi ile birlestirilir.

## Yeni Domain Eklenebilirlik
- Config dosyasi: `shipyard_app/config/platform_domains.json`
- Her domain icin `module_path` tanimi var.
- Yeni domain eklemek icin:
  1. `platform/domains/<domain>.py` icinde adapter olustur.
  2. `platform_domains.json` icine domain kaydi ekle.
  3. Gerekirse hook/site config ile override et (`shipyard_platform`).

## API Katmani
Konum: `shipyard_app/platform/api.py`

- `get_platform_context`
- `get_domain_context`
- `is_domain_capability_enabled`

Bootstrap:
- `bootstrap_platform_layer` onboarding akisina baglandi.
- `tenant_onboarding.bootstrap_shipyard_setup` artik platform katmanini da kuruyor.

## Notlar
- ERPNext core degistirilmedi.
- Domain kurallari hardcode tenant mantigi yerine config + feature profile ile cozumlendi.
- Multi-tenant izolasyon modeli korunuyor (site/db bazli).
