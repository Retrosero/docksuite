# System Stabilization Layer

## Amac
- Shipyard SaaS icin tenant-safe stabilizasyon katmani tanimlamak.
- Loglama, error tracking, health check ve backup request akislarini standardize etmek.
- ERPNext core'a dokunmadan custom app uzantilariyla calismak.

## Kapsam

### 1) Logging System
- Tenant bazli loglama custom DocType ile tutulur.
- Severity ayrimi: `Info`, `Warning`, `Error`.
- Hata olaylarinda endpoint, user, status code ve traceback saklanir.
- Log kayitlari support incelemesi icin site bazinda kalir.

### 2) Error Tracking
- Hata hangi tenantta oldu, `tenant_site` ile gorunur.
- Hangi kullanicida oldu, `user` ile gorunur.
- Hangi endpointte oldu, `endpoint` ile gorunur.
- Gerekirse `reference_doctype` ve `reference_name` ile baglamsal izlenebilirlik saglanir.

### 3) Health Check
- `health_check` endpointi calisir.
- DB baglantisi `select 1` ile kontrol edilir.
- Redis baglantisi `frappe.cache().ping()` mantigi ile kontrol edilir.
- Sonuc `ok`, `db`, `redis`, `tenant_site`, `checked_at` alanlari ile dondurulur.

### 4) Backup Strategy
- Backup site/tenant bazinda tasarlanir.
- Backup scope secenekleri:
  - Full Site
  - Database Only
  - Files Only
- Manual backup tetikleme, backup request kaydi olusturur.
- Gercek backup calistirma operasyonel katmanda daha sonra baglanabilir; bu fazda request tracking yeterlidir.

## Uygulama Karari
- Yeni custom DocType kullanilir:
  - `System Log Entry`
  - `Tenant Backup Request`
- Mevcut standard ERPNext DocType'lari degistirilmez.
- Core override yerine custom app hook ve helper fonksiyonlari kullanilir.

## Tenant-Safe Ilkeler
- Kod icine tenant ozel sabit deger gomulmez.
- Tenant ayrimi site seviyesinde ele alinir.
- Log ve backup kayitlari sadece ilgili site veritabani icinde tutulur.

## Basit Operasyon Akisi
1. Uygulama baslar.
2. Stabilization bootstrap calisir.
3. Log ve backup request DocType'lari garanti edilir.
4. Monitoring `health_check` endpointini cagirir.
5. Hata durumunda `log_error` kullanilir.
6. Manuel backup icin `request_manual_backup` cagrilir.
