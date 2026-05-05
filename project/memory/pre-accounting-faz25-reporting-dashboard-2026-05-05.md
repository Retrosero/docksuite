# Ön Muhasebe Faz 25 - Raporlama ve Yönetim Panelleri - 2026-05-05

## Kapsam
Rol bazlı dashboard, tahsilat performansı, vade analizi ve nakit akışı raporları.

## Teknik Not
- Backend: Rapor API'leri (nakit akışı, vade analizi, tahsilat performansı)
- Frontend: Rol bazlı rapor widget'ları
- CSV/PDF export desteği
- Plan bazlı rapor kapsamı

## Rapor Türleri
| Rapor | Açıklama | Rol Erişimi |
|-------|----------|-------------|
| Nakit Akışı | Giriş/çıkış özet, dönemsel karşılaştırma | yonetici, muhasebe_sorumlusu |
| Vade Analizi | Cari yaşlandırma, vade bazlı sınıflandırma | yonetici, muhasebe_sorumlusu |
| Tahsilat Performansı | Tahsilat oranı, hedef/gerçekleşen | yonetici, satis_operasyon |
| Kar/Zarar Özeti | Dönemsel kar/zarar raporu | yonetici |

## Doğrulama
- `npm run -s build`
- Rapor listesi ve filtreleme testi
