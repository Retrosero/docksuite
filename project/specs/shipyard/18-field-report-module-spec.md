# Field Report Module Spec

## Amac
Sahadan not, sorun ve fotograf bildirimlerini merkezi kayda almak.

## Neden New DocType?
- Tekrarlayan saha bildirimi gecmisi vardir.
- Ayrik liste/form ihtiyaci vardir.
- Mevcut tek bir DocType alan uzatisi ile cozulmez.

## Alanlar (MVP)
- task_ref
- employee (Employee link)
- report_datetime
- description
- photo (Attach)
- status
- issue_type
- has_issue

## Child Table Karari
- Bu fazda child table kullanilmadi.
- Tek bildirimi tek kayit modeli ile basit ve tekrar kurulabilir yapi secildi.

## SaaS/Tenant-Safe Notu
- Firma ozel hardcode yok.
- Model tenant bagimsiz urun mantiginda tasarlandi.
- Fixture ile yeni tenantlara tekrar uygulanabilir.

## Dogrulama Notu (2026-04-13)
- Site: `shipyard.localhost`
- `ensure_field_report_doctype` basarili.
- `validate_field_report_setup` sonucu: doctype ve tum alanlar aktif.
- `create_field_report_smoke` sonucu: kayit olusturuldu (`tgae3homrq`).
- `bench --site shipyard.localhost migrate` basarili.
