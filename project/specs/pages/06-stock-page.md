# Stok Sayfası Spec

## Amaç
Stok kartlarını, stok miktarlarını ve temel stok hareket bağlamını sade biçimde göstermek.

## ERPNext karşılığı
- Item
- Warehouse
- Stock Entry

## Temel liste alanları
- item_code
- item_name
- item_group
- stock_uom
- barcode (varsa)
- shipyard_secondary_aisle (varsa)
- is_critical_stock (varsa)
- stok miktarı özeti

## Önerilen API kullanımı
GET /api/resource/Item?fields=["name","item_code","item_name","item_group","stock_uom","barcode","shipyard_secondary_aisle","is_critical_stock"]&limit_page_length=20
GET /api/resource/Item/{name}

## UI notları
- mobilde kart görünümü
- masaüstünde tablo
- barkod ve ürün adı ön planda
- kritik stok etiketi görünür olmalı
