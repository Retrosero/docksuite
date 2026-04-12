# Shipyard Rules — Domain Modeling

## Custom Field yapılabilecek örnekler
- Item → malzeme türü
- Item → kullanım bölgesi
- Item → kritik stok
- Employee → ekip
- Employee → uzmanlık
- Attendance → saha lokasyonu

## New DocType yapılabilecek örnekler
- Zimmet
- Field Report
- Task
- Task Progress
- Team Assignment
- Technical Document Link

## Hızlı karar
- özellik ise Custom Field
- hareket/geçmiş ise New DocType

## SaaS ek kuralı
- Yeni yapı her firmada tekrar kullanılabilir olmalı
- Tenant'a özel sabit mantık DocType içine gömülmemeli
- Gerekirse tenant bazlı ayarlar ayrı config mantığında düşünülmeli
