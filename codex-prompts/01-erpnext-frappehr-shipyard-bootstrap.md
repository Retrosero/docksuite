# Codex Prompt 01 — ERPNext + Frappe HR + Shipyard Bootstrap

Aşağıdaki görevi adım adım uygula.

## Hedef
Bu makinede Frappe Bench tabanlı bir çalışma ortamı kur.
Ardından:
- ERPNext'i yükle
- HR ve Payroll için Frappe HR uygulamasını yükle
- Shipyard projesi için başlangıç klasör yapısını hazırla
- Dokümantasyon klasörlerini AI-friendly olacak şekilde oluştur

## Kritik Kurallar
- ERPNext core dosyalarını değiştirme.
- Frappe ve ERPNext üçüncü parti çekirdek gibi kalsın.
- Tüm özel geliştirmeleri custom app yapısında planla.
- Çoklu müşteri mimarisi ileride subdomain + ayrı site + ayrı veritabanı olacak şekilde düşün.
- Şimdilik sadece geliştirme ortamını ve klasör omurgasını hazırla.
- Eğer sistemde eksik bağımlılık varsa önce tespit et, sonra düzelt.
- Her büyük adımdan sonra kısa teknik özet ver.

## Kurulum Hedefi
1. Bench kurulumunu doğrula
2. Yeni bir bench oluştur
3. Yeni bir site oluştur
4. ERPNext app'ini yükle
5. Frappe HR app'ini yükle
6. Siteye ERPNext ve HR uygulamalarını kur
7. Aşağıdaki custom app isimlerini oluştur ama içine henüz iş mantığı yazma:
   - core_app
   - shipyard_app
8. Aşağıdaki klasör yapısını oluştur:
   - docs/erpnext/reference
   - docs/erpnext/project-usage
   - docs/erpnext/decisions
   - rules
   - skills
   - specs/shipyard
   - memory
9. Bu klasörlere boş değil, anlamlı başlangıç markdown dosyaları koy
10. Son durumda oluşan klasör ağacını ve kullanılan komutları raporla

## İsimlendirme
Bench adı: `serhan-bench`
Site adı: `shipyard.localhost`

## Beklenen app yapısı
apps/
- frappe
- erpnext
- hrms veya frappe hr uygulaması
- core_app
- shipyard_app

## Beklenen proje klasörleri
project/
- docs/
- rules/
- skills/
- specs/
- memory/

## Son kısım
İş bittiğinde:
1. hangi komutları çalıştırdığını listele
2. hangi dosyaları oluşturduğunu listele
3. benim bir sonraki promptta vereceğim “shipyard domain model” çalışmasına hazır hale getir
