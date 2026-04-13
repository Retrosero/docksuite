# Personel Listesi Sayfası Spec

## Amaç
İK, yönetici ve formen için çalışanları sade, filtrelenebilir ve mobil uyumlu şekilde göstermek.

## ERPNext / HRMS karşılığı
- Employee
- gerekirse Department / Designation
- ek bağlam için shipyard custom field'ları

## Sayfa bölümleri
- üst filtre barı
- çalışan liste/grid görünümü
- çalışan kartı / satır
- detay açılır paneli
- hızlı aksiyonlar

## Temel filtreler
- ad / kod arama
- ekip
- uzmanlık
- aktif/pasif
- departman
- vardiya türü

## Liste alanları
- employee_name
- employee_number
- status
- company
- department
- designation
- shipyard_team_ref (varsa)
- shipyard_specialty (varsa)

## Önerilen API kullanımı
GET /api/resource/Employee?fields=["name","employee_name","employee_number","status","company","department","designation","shipyard_team_ref","shipyard_specialty"]&limit_page_length=20

## UI notları
- mobilde kart görünümü
- masaüstünde tablo + filtre
- ERP karmaşıklığı gösterilmez
- sadece gerekli alanlar gösterilir
