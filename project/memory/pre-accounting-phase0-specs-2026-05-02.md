# Ön Muhasebe Faz 0 Specs Notu - 2026-05-02

## Kapsam
Faz 0'ın ikinci adımı tamamlandı:
- ERPNext standard DocType eşleme tablosu eklendi.
- `pre-accounting-portal` ilk iskelet spec'i eklendi.

## Eklenen Spec Dosyaları
- `project/specs/pre-accounting/01-standard-doctype-mapping.md`
- `project/specs/pre-accounting/02-portal-skeleton-spec.md`

## Temel Kararlar
- Ön muhasebe modülleri önce standard ERPNext DocType'lara bağlanacak.
- Faz 0-1'de gereksiz custom DocType açılmayacak.
- Portal klasör yapısı feature-based ve React Native'e taşınabilir domain katmanı ile kurulacak.
- Ayar kontrollü UI yaklaşımı iskelete zorunlu olarak dahil edildi.

## Sonraki Adım
Faz 1'e geçiş için `project/frontend/pre-accounting-portal` klasöründe Vite + React + TypeScript iskeleti açılmalı ve dashboard/cari skeleton sayfaları hazırlanmalı.
