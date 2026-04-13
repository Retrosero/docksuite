# Logging Structure

## Amac
- Tenant bazli operasyon loglarini tek yerde toplamak.
- Hata, warning ve info kayitlarini ayirmak.
- Support ve operasyon incelemesi icin baglamsal alanlar saklamak.

## DocType: System Log Entry
- `tenant_site`
- `logged_at`
- `severity`
- `category`
- `message`
- `endpoint`
- `http_method`
- `user`
- `reference_doctype`
- `reference_name`
- `status_code`
- `details`
- `traceback`

## Kullanim Kurali
- Log kaydi tenant site uzerinden yazilir.
- Hata olustugunda user ve endpoint kaydi birlikte tutulur.
- Health check gibi sistem olaylari `category=health` ile isaretlenir.
- Backup talep loglari `category=backup` ile isaretlenir.

## Error Tracking Notu
- Bir hata kaydinda en az su alanlar bulunur:
  - tenant site
  - user
  - endpoint
  - severity
  - message
  - traceback
