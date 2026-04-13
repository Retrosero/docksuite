# Vardiya Takibi Sayfası Spec

## Amaç
Çalışanların vardiya tiplerini, planlarını ve attendance ilişkilerini sade şekilde göstermek.

## ERPNext / HRMS karşılığı
- Shift Type
- Attendance
- Employee Checkin (gerekiyorsa)

## Sayfa bölümleri
- vardiya filtreleri
- çalışan bazlı vardiya listesi
- bugünkü vardiyalar özeti
- shift detayı
- attendance durumu

## Önerilen API kullanımı
GET /api/resource/Shift Type
GET /api/resource/Attendance?fields=["name","employee","attendance_date","shift","status"]&filters=[["attendance_date","=",<tarih>]]

## UI notları
- bugünkü vardiyalar ekranı ayrı olabilir
- formen görünümünde ekip bazlı özet gerekir
- işçi görünümünde kendi vardiyam ekranı daha sade tutulur
