# Ön Muhasebe Faz 22 - İşlem Bazlı Yetki Matrisi - 2026-05-05

## Kapsam
Rol şablonlarına ek olarak tutar bazlı kısıtlama ve belge durumu kontrolü eklenmiştir.

## Teknik Not
- Tutar limiti: Her aksiyon için minimum ve maksimum tutar belirlenebilir
- Belge durumu kontrolü: taslak, onaylı, iptal durumlarına göre yetki
- Backend API'lerde tutar limiti kontrolü
- Frontend'de kullanıcıya bilgi mesajı gösterimi

## Tutar Limitleri
| Aksiyon | Limit | Açıklama |
|---------|-------|----------|
| Satış Faturası Oluştur | - | Tüm roller |
| Satış Faturası Onayla | 50.000 TL | Yönetici/Muhasebe Sorumlusu |
| Tahsilat Oluştur | 100.000 TL | Tüm yetkili roller |
| Tahsilat Onayla | 50.000 TL | Yönetici/Muhasebe Sorumlusu |
| Transfer Oluştur | 25.000 TL | Sadece Yönetici |
| Gider Oluştur | 10.000 TL | Muhasebe Sorumlusu |
| Gider Onayla | 25.000 TL | Yönetici |

## Belge Durumu Kontrolü
- Sadece taslak belgeler güncellenebilir/iptal edilebilir
- Onaylı belgeler sadece yetkili rol onaylayabilir
- İptal belgeler üzerinde işlem yapılamaz

## Güvenlik Prensibi
- UI validasyonu ≠ yetki (backend doğrulaması şart)
- Tüm kritik işlemlerde tutar limiti kontrolü
- Audit log tutulur

## Doğrulama
- `npm run -s build`
- Tutar limiti aşımında hata mesajı
