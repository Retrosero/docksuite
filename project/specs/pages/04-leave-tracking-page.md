# İzin Takibi Sayfası Spec

## Amaç
Çalışan izinlerini, tahsisleri ve kullanım durumunu sade şekilde göstermek.

## ERPNext / HRMS karşılığı
- Leave Application
- Leave Allocation
- Leave Policy
- Leave Period

## Önerilen API kullanımı
GET /api/resource/Leave Application?fields=["name","employee","leave_type","from_date","to_date","total_leave_days","status"]
GET /api/resource/Leave Allocation?fields=["name","employee","leave_type","from_date","to_date","new_leaves_allocated"]

## UI notları
- çalışan tarafında "izinlerim"
- yönetici tarafında onay ekranı
- İK tarafında özet rapor görünümü
