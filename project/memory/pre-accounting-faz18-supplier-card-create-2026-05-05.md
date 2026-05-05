# Ön Muhasebe Faz 18 - Tedarikçi Kartı Oluşturma - 2026-05-05

## Kapsam
- Spec oluşturuldu: `15-supplier-card-create-spec.md`.
- Cari ekranına ayar kontrollü `Yeni Tedarikçi` hızlı kart formu eklendi.
- `Supplier Group` ERPNext lookup olarak okunur; koda tenant özel tedarikçi grubu gömülmez.
- Backend feature settings listesi frontend ayarlarıyla hizalandı.

## Teknik Not
- Tedarikçi kartı ERPNext standart `Supplier` resource API ile oluşturulur.
- Yeni DocType veya veri kopyası eklenmedi.
- Form validasyonu shared validation katmanına eklendi.
- Canlı kullanım kontrol paneli müşteri, tedarikçi ve ürün hızlı kart oluşturma durumunu birlikte kontrol eder.

## Doğrulama
- `npm test -- --run`
- `npm run test:e2e`
- `npm run -s build`
