# Ön Muhasebe Faz 26 - e-Belge ve Muhasebe Çekirdek - 2026-05-05

## Kapsam
e-Belge hazırlık ve durum yönetimi, dönem kapanış kontrolleri, cari mutabakat ve risk limitleri.

## Teknik Not
- e-Belge durum takibi: Taslak, Gönderildi, Onaylandı, İptal
- Dönem kapanış kontrolleri: açık işlem, onaysız belge kontrolü
- Cari mutabakat: bakiye karşılaştırma, mutabakat onayı
- Risk limitleri: müşteri bazlı kredi limiti, alacak riski izleme

## e-Belge Durumları
| Durum | Açıklama | İşlem |
|-------|----------|-------|
| Draft | Taslak | Düzenlenebilir |
| Submitted | Gönderildi | İptal edilebilir |
| Cancelled | İptal | Görüntüleme |

## Dönem Kapanış Kontrolleri
1. Açık tahsilat/ödeme kontrolü
2. Onaysız fatura kontrolü
3. Vadesi geçmiş işlem uyarısı
4. Kasa/banka mutabakatı

## Doğrulama
- `npm run -s build`
- Dönem kapanış checklist testi
