# Ön Muhasebe Kuralları - Mobil ve React Native Hazırlığı

## Amaç
Web portal bugün React ile geliştirilecek olsa bile domain mantığı ileride React Native mobil uygulamaya taşınabilir olmalıdır.

## Kurallar
1. API çağrıları component içine yazılmaz.
2. Domain servisleri, tipleri ve validasyonları UI framework'ünden bağımsız tutulur.
3. Para, tarih, durum ve belge numarası formatlama helper'ları shared katmanda tutulur.
4. Web'e özel DOM davranışı domain katmanına sızdırılmaz.
5. Mobil hızlı işlem ekranları için minimum alanlı form yaklaşımı korunur.
6. Loading, empty, error ve retry durumları her veri ekranında tasarlanır.
7. Dar ekranlarda tek elle kullanım düşünülür.
8. Uzun tablo yerine kart/liste ve filtreli görünüm tercih edilir.
9. Offline veya zayıf bağlantı senaryosu için kullanıcıya net Türkçe hata mesajı verilir.
10. Bildirim, kamera, dosya ve paylaşım gibi mobil özellikler için adapter katmanı düşünülür.
