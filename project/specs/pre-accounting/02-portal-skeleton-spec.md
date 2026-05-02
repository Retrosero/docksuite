# Ön Muhasebe Faz 0 - Portal İskeleti Spec'i

## Amaç
`project/frontend/pre-accounting-portal` uygulamasının ilk iskeletini, React Native'e taşınabilir domain katmanı ile birlikte netleştirmek.

## Teknoloji Kararı
- Web: React + TypeScript + Vite
- Veri erişimi: merkezi ERPNext REST client
- UI: mobile-first component-first yapı
- Dil: tamamen Türkçe
- Çok tenant: tenant config ile yönetim

## Klasör Yapısı

```text
project/frontend/pre-accounting-portal/
  src/
    app/
      App.tsx
      routes.ts
      AppShell.tsx
    config/
      tenant.ts
      featureFlags.ts
    services/
      erpApi.ts
      authService.ts
      settingsService.ts
    shared/
      ui/
      hooks/
      utils/
      types/
    features/
      dashboard/
      cari/
      sales-invoice/
      collections/
      expenses/
      stock/
      reports/
      settings/
    pages/
      dashboard/
      cari/
      sales/
      tahsilat/
      gider/
      stok/
      raporlar/
      ayarlar/
```

## Katman Sözleşmesi

### `app`
- Route ve shell orkestrasyonu yapar.
- İş mantığı taşımaz.

### `features/*`
- Domain bazlı UI + hook + service organizasyonu içerir.
- Her feature en az:
  - `types.ts`
  - `services/*.ts`
  - `hooks/*.ts`
  - `components/*.tsx`

### `services`
- ERPNext REST çağrıları merkezi katmandadır.
- Ortak hata dönüşümü ve session davranışı burada tutulur.

### `shared`
- UI primitive'leri
- formatter/helper'lar
- ortak tipler
- tekrar kullanılabilir hook'lar

## React Native'e Taşınabilirlik Tasarımı
1. Domain servisleri ve tipler framework bağımsız yazılır.
2. `features/*/services` içinde DOM bağımlılığı olmaz.
3. Tarih/para formatlama `shared/utils` altında soyutlanır.
4. Ekran state yönetimi UI'dan bağımsız testlenebilir olmalıdır.
5. Mobilde kullanılacak hızlı işlem akışları şimdiden feature bazlı ayrılır.

## Ayar Kontrollü UI Entegrasyonu
Tüm opsiyonel görünürlükler tek yerden yönetilir:
- `settingsService` tenant ayarlarını çeker.
- `featureFlags.ts` varsayılanları tutar.
- Sayfa/feature bileşenleri ayar anahtarı ile render kararı verir.

İlk zorunlu ayar anahtarları:
- `dashboard.show_overdue_receivables`
- `sales_invoice.show_discount_button`
- `customer.show_balance_panel`
- `stock.show_low_stock_alert`
- `mobile.enable_quick_collection`

## İlk Sayfa Listesi
1. `DashboardPage`
2. `CariListPage`
3. `SalesInvoiceListPage`
4. `CollectionEntryPage`
5. `ExpenseListPage`
6. `StockOverviewPage`
7. `ReportsPage`
8. `SettingsPage`

## API İlkeleri
1. Önce standard resource endpoint kullanılır.
2. Endpoint sözleşmeleri `services` katmanında tiplenir.
3. Component içine doğrudan `fetch` yazılmaz.
4. Tüm hata mesajları kullanıcıya Türkçe dönüştürülür.

## Mobil Uyum İlkeleri
1. Dar ekranlarda kart tabanlı görünüm önceliklidir.
2. Kritik işlem butonları tek elle kullanıma uygun konumlanır.
3. Uzun formlar bölüm/senaryo bazında parçalanır.
4. Loading/empty/error durumları her ekranda zorunludur.

## Faz 1 Çıkış Kriteri
Portal iskeleti tamamlandı sayılmadan önce:
1. route yapısı ve app shell çalışır olmalı
2. tenant config katmanı hazır olmalı
3. merkezi ERP API client hazır olmalı
4. settings/feature flag akışı bağlı olmalı
5. en az dashboard ve cari sayfası skeleton seviyesinde açılmalı
6. tüm metinler Türkçe olmalı
