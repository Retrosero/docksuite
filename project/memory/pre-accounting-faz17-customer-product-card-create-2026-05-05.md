# Ön Muhasebe Faz 17 - Müşteri ve Ürün Kartı Oluşturma - 2026-05-05

## Kapsam
- Gelişmiş spec oluşturuldu: `14-customer-product-card-create-advanced-spec.md`.
- Müşteriler ekranına ayar kontrollü `Yeni Müşteri` hızlı kart formu eklendi.
- Ürünler ekranına ayar kontrollü `Yeni Ürün` hızlı kart formu eklendi.
- `Customer Group`, `Territory`, `Item Group` ve `UOM` değerleri lookup olarak okunur; koda tenant özel sabit gömülmez.

## Teknik Not
- `Customer` ve `Item` standard ERPNext resource API ile oluşturulur.
- Yeni DocType veya veri kopyası eklenmedi.
- Form validasyonları shared validation katmanına eklendi.
- Canlı kullanım kontrol paneline müşteri/ürün hızlı kart oluşturma kontrolü eklendi.

## Doğrulama
- `npm test -- --run`
- `npm run test:e2e`
- `npm run -s build`
