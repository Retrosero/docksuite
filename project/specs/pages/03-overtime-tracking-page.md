# Ek Mesai Takibi Sayfası Spec

## Amaç
Ek mesai taleplerini, girişlerini ve onay durumlarını izlemek.

## ERPNext / HRMS karşılığı
ERPNext/HRMS içinde vardiya, attendance ve payroll çekirdeği vardır; ancak ek mesai için proje özelinde custom yapı gerekebilir.

## Önerilen veri modeli yaklaşımı
- mevcutsa custom DocType: Overtime Request / Overtime Entry
- Employee ile link
- Attendance günüyle ilişki
- onay durumu
- saat bilgisi

## Önerilen API kullanımı
GET /api/resource/Overtime Request
POST /api/resource/Overtime Request
GET /api/resource/Attendance?filters=...

## UI notları
- yönetici/formen için onay görünümü
- çalışan için kendi ek mesai kayıtları
- bordroya etkisi varsa ayrı bilgi etiketi
