# Bordro Sayfası Spec

## Amaç
İK veya yönetici için bordro toplu işleme ve bordro kayıtlarını sade şekilde göstermek.

## ERPNext / HRMS karşılığı
- Payroll Entry
- Salary Structure
- Salary Slip
- Payroll Settings

## Önerilen API kullanımı
GET /api/resource/Payroll Entry
GET /api/resource/Salary Slip?filters=[["posting_date",">=",<başlangıç>],["posting_date","<=",<bitiş>]]

## UI notları
- bordro motorunu yeniden yazma
- sadece daha sade görüntü ve işlem ekranı sağla
- yalnızca yetkili roller görebilsin
