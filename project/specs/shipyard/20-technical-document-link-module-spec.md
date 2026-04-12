# Technical Document Link Module Spec

## Amac
Gorev/proje/saha kayitlari ile teknik dokumanlar arasinda izlenebilir bag kurmak.

## Neden New DocType?
- Dokuman baglari tekrarlayan iliski kayitlaridir.
- Revizyon ve aktiflik takibi gerekir.
- Tek bir Custom Field ile bu akis genisleyemez.

## Alanlar (MVP)
- linked_type
- linked_name
- file_ref
- document_url
- revision_no
- is_active
- note

## Child Table Karari
- Bu fazda child table kullanilmadi.
- Her dokuman-baglantisi tek kayit olarak tutuldu.

## SaaS/Tenant-Safe Notu
- Firma ozel hardcode yok.
- Model urun-genel tekrar kurulabilir yapidadir.
- Fixture ile yeni tenantlara tasinabilir.

## Dogrulama Notu (2026-04-13)
- Site: `shipyard.localhost`
- `ensure_technical_document_link_doctype` basarili.
- `validate_technical_document_link_setup` sonucu: doctype ve tum alanlar aktif.
- `create_technical_document_link_smoke` sonucu: kayit olusturuldu (`d4jcmvak38`).
- Not: `bench --site shipyard.localhost migrate` adimi `redis_cache` servisi calismadigi icin bu turda basarisiz dondu.
