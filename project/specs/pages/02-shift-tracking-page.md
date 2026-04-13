# Vardiya Takibi Sayfasi Spec

## Amac
Calisanlarin vardiya tiplerini, planlarini ve attendance iliskilerini sade sekilde gostermek.

## ERPNext / HRMS Karsiligi
- Shift Type
- Attendance
- Employee Checkin (gerekiyorsa)

## Sayfa Bolumleri
- vardiya filtreleri
- calisan bazli vardiya listesi
- bugunku vardiyalar ozeti
- shift detayi
- attendance durumu

## Onerilen API Kullanimi
GET /api/resource/Shift Type
GET /api/resource/Attendance?fields=["name","employee","attendance_date","shift","status"]&filters=[["attendance_date","=",<tarih>]]

## UI Notlari
- bugunku vardiyalar ekrani ayri olabilir
- formen gorunumunde ekip bazli ozet gerekir
- isci gorunumunde kendi vardiyam ekrani daha sade tutulur

## Rol ve Erisim Notu
- Formen/calisan mod secimi backend rol dogrulamasi ile belirlenmelidir.
- `Shipyard Foreman`, `Shipyard Manager` ve `System Manager` rolleri formen gorunumunu acabilir.
- Diger rollerde ekran varsayilan olarak calisan gorunumunde acilir ve formen toggle gosterilmez.
