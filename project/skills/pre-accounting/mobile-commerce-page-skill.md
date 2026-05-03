# Skill - Mobil Ticari Sayfa Tasarlama

## Amaç
Satış, tahsilat, alış, müşteri, ürün, stok, rapor, ayarlar ve gün sonu sayfalarını ERPNext verisini kullanan ama ERPNext temasına benzemeyen mobil-first ürün ekranları olarak tasarlamak.

## Adımlar
1. Sayfanın ERPNext DocType karşılığını belirle.
2. Standart resource API yeterliyse özel endpoint açma.
3. `types.ts`, `services`, `hooks`, `components`, `pages` ayrımını koru.
4. Component içine doğrudan `fetch` yazma.
5. Mobilde tablo yerine kart/list görünümünü önce değerlendir.
6. Tüm metinleri Türkçe karakterlerle yaz.
7. Opsiyonel panel, filtre veya rozet varsa ayar anahtarı tanımla.
8. Expo/React Native'e taşınacak domain verisini DOM bağımsız tut.

## Çıktı
- ERPNext DocType eşlemesi
- API planı
- component listesi
- ayar anahtarları
- mobil görünüm notu
- React Native taşınabilirlik notu
