# REST API / Resource Pattern

## Temel yaklaşım
Frappe/ERPNext DocType'lar için resource tabanlı CRUD API sunar.

## Düşünme şekli
Bir ekrana veri yazdırmadan önce şunları netleştir:
1. hangi DocType?
2. hangi operasyon?
3. minimum zorunlu alanlar neler?
4. lookup alanları nereden gelecek?
5. response tipi nasıl modellenmeli?
