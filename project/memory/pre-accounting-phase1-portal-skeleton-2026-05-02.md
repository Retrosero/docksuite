# On Muhasebe Faz 1 - Portal Iskeleti (2026-05-02)

## Kapsam
`project/frontend/pre-accounting-portal` icin calisir Vite + React + TypeScript iskeleti kuruldu.

## Yapilanlar
- Yeni frontend projesi olusturuldu:
  - `project/frontend/pre-accounting-portal`
- Mimari katmanlar acildi:
  - `src/app`
  - `src/config`
  - `src/services`
  - `src/shared`
  - `src/features`
  - `src/pages`
- Basit route altyapisi eklendi (`useAppRoute` + `routes`).
- Turkce ana menulu `AppShell` eklendi.
- Ilk sayfalar acildi:
  - Dashboard
  - Cari
  - Satis Faturalari
  - Tahsilat
  - Gider
  - Stok
  - Raporlar
  - Ayarlar
- Ayar kontrollu ozellik sistemi eklendi:
  - `settingsService` (localStorage tabanli)
  - `useFeatureSettings` hook'u
  - Ayarlar sayfasinda toggle kontrollu yapi
- Ayar anahtarlari iskelete baglandi:
  - `dashboard.show_overdue_receivables`
  - `sales_invoice.show_discount_button`
  - `customer.show_balance_panel`
  - `stock.show_low_stock_alert`
  - `mobile.enable_quick_collection`
- Mobil uyumlu temel stil dosyasi eklendi (`src/styles/global.css`).

## Dogrulama
- `npm run build` basarili.
- Dev server calisiyor:
  - `http://localhost:5180/`

## Sonraki Adim
Faz 2 baslangicinda Dashboard ve Cari modullerini ERPNext standard API kaynaklariyla canli veriye baglamak.
