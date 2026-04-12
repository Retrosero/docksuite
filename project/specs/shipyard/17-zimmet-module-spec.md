# Zimmet Module Spec

## Amac
Calisana verilen ekipman veya malzemenin teslim ve iade gecmisini tek yerde takip etmek.

## Neden New DocType?
- Tekrarlayan teslim/iade hareketi vardir.
- Ayrik liste/form ihtiyaci vardir.
- Mevcut DocType'a tek alan eklemekle cozulmez.

## Alanlar (MVP)
- employee (Employee link)
- item (Item link)
- quantity
- delivery_date
- return_date
- return_status
- delivered_by (Employee link)
- note

## Child Table Karari
- Bu fazda child table kullanilmadi.
- Her zimmet kaydi tek teslim olayi olarak modellenerek minimum calisan yapi secildi.

## SaaS/Tenant-Safe Notu
- Firma ozel sabit alan veya kural yok.
- Model tum tenant'larda ayni sekilde tekrar kurulabilir.
- Kurulum `shipyard_app` fixture'lariyla tekrar uygulanabilir.

## Dogrulama Notu (2026-04-12)
- Site: `shipyard.localhost`
- `ensure_zimmet_doctype` basarili calisti.
- `validate_zimmet_setup` sonucu: doctype mevcut ve tum alanlar aktif.
- `create_zimmet_smoke` sonucu: zimmet kaydi olusturuldu (`q32t72ghs3`).
- `bench --site shipyard.localhost migrate` basarili.
