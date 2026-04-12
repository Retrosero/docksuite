# Task Progress Module Spec

## Amac
Gorevler icin ilerleme gecmisini tarih/saat bazli ve olculu kayitlarla takip etmek.

## Neden New DocType?
- Ilerleme girisleri tekrarlayan hareket kayitlaridir.
- Ayrik liste/form gerektirir.
- Tek bir mevcut kayda ozellik eklemek bu ihtiyaci karsilamaz.

## Alanlar (MVP)
- task_ref
- employee (Employee link)
- progress_datetime
- progress_percent
- status
- note

## Child Table Karari
- Bu fazda child table kullanilmadi.
- Her ilerleme olayi tek satir kayit olarak tutuldu.

## SaaS/Tenant-Safe Notu
- Firmaya ozel sabit kural yok.
- Model tum tenantlarda tekrar kurulabilir.
- Fixture ile yeni siteye ayni sekilde uygulanabilir.

## Dogrulama Notu (2026-04-13)
- Site: `shipyard.localhost`
- `ensure_task_progress_doctype` basarili.
- `validate_task_progress_setup` sonucu: doctype ve tum alanlar aktif.
- `create_task_progress_smoke` sonucu: kayit olusturuldu (`0qmi6n1p1m`).
- `bench --site shipyard.localhost migrate` basarili.
