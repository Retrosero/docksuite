# Ön Muhasebe Faz 20 - Dashboard ve Tahsilat Özet Kartları - 2026-05-05

## Kapsam
- Dashboard'a tahsilat özet kartı eklenecek.
- Tahsilat ekranına toplam tahsilat ve bugünkü tahsilat kartları eklenecek.
- Fatura durumu metrikleri genişletilecek.
- Mobil uyumlu özet kartları eklenecek.

## Teknik Not
- Backend değişikliği yok; mevcut API'ler kullanılacak.
- Dashboard hook'unda tahsilat ve ödeme özetleri hesaplanacak.
- Tahsilat sayfasında tarih filtreleme eklenecek.
- Özet kartları CSS grid ile mobil uyumlu gösterilecek.

## Doğrulama
- `npm run -s build`
- Mobil görünüm kontrolü
