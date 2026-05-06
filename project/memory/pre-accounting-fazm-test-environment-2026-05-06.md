# Faz M - Test Ortami ve Demo Data (2026-05-06)

## Kapsam
Test ortami kurulumu ve demo data olusturma.

## Yapilanlar

### Backend (pre_accounting_test_data.py)
- `create_demo_company()`: Demo sirket olusturma
- `create_demo_customers()`: Demo musteriler (3 adet)
- `create_demo_suppliers()`: Demo tedarikciler (3 adet)
- `create_demo_items()`: Demo urunler/hizmetler (4 adet)
- `seed_demo_invoices()`: Demo faturalar (10 adet, son 30 gun)
- `reset_demo_data()`: Tum demo verilerini silme
- `get_test_status()`: Test ortami durumu sorgulama

### Frontend (testUtils.ts)
- Test status sorgulama fonksiyonlari
- Demo data olusturma fonksiyonlari
- `setupFullDemoData()`: Tum verileri sirasiyla olusturma
- Mock data generators

## Teknik Notlar
- Demo veri isimleri "DEMO-" on eki ile baslar
- Faturalar rastgele son 30 gune dagitilir
- Reset islemi geri alinamaz dikkatli kullanilmalidir

## Sonraki Adim
Faz N ile UI/UX iyilestirmeleri (loading states, error boundaries).