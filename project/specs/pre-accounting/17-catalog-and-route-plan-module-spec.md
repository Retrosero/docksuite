# Ön Muhasebe Faz 30+ - Katalog Modülü ve Rota Planı Spesifikasyonu

## Genel Bakış
Bu doküman ön muhasebe uygulaması için üç ana özelliği kapsar:
1. **Faz 29** - Satış ekranı müşteri/stok listesi düzeltmesi
2. **Faz 30** - Ürün katalog modülü (resim, barkod, raf, koli, ambalaj, marka, kategori, açıklama)
3. **Faz 31** - Rota planı modülü (güne başlama/günü bitirme)

---

## Faz 29 - Satış Ekranı Veri Sorunu Düzeltme

### 29.1 Sorun Tanımı
Ön muhasebe uygulamasında yeni satış oluşturmak istendiğinde:
- Müşteri dropdown'ı boş geliyor
- Ürün dropdown'ı boş geliyor
- Kullanıcı hata mesajı görmüyor

### 29.2 Tespit Edilen Sorunlar

| Dosya | Sorun | Etki |
|-------|-------|------|
| `salesInvoiceService.ts` - `fetchSalesCustomers()` | Filtreler çok kısıtlayıcı olabilir | Müşteri listesi boş |
| `salesInvoiceService.ts` - `fetchSalesItems()` | `disabled=0` alan tipi uyumsuzluğu | Ürün listesi boş |
| `useSalesInvoiceData.ts` | `.catch(() => [])` sessiz hata | Hata mesajı yok |

### 29.3 Çözüm

#### 29.3.1 Service Düzeltmesi
```typescript
// fetchSalesCustomers() - Mevcut
export async function fetchSalesCustomers(): Promise<CustomerRow[]> {
  return getResourceList<CustomerRow>('Customer', {
    fields: ['name', 'customer_name'],
    orderBy: 'modified desc',
    limit: 100,
  })
}

// fetchSalesItems() - Mevcut (sorunlu)
export async function fetchSalesItems(): Promise<ItemRow[]> {
  return getResourceList<ItemRow>('Item', {
    fields: ['name', 'item_name'],
    filters: [['disabled', '=', 0]], // Problem: boolean/string uyumsuzluğu
    orderBy: 'modified desc',
    limit: 100,
  })
}
```

#### 29.3.2 Hook Düzeltmesi
```typescript
// useSalesInvoiceData.ts - Geliştirilmiş hata yönetimi
const load = async () => {
  setIsLoading(true)
  setError(null)
  try {
    const [invoiceRows, quotationRows, customerRows, itemRows, modeRows] = await Promise.all([
      fetchSalesInvoices().catch((e) => { console.error('Fatura hatası:', e); return [] }),
      fetchSalesQuotations().catch((e) => { console.error('Teklif hatası:', e); return [] }),
      fetchSalesCustomers().catch((e) => { console.error('Müşteri hatası:', e); return [] }),
      fetchSalesItems().catch((e) => { console.error('Ürün hatası:', e); return [] }),
      fetchModeOfPayments().catch((e) => { console.error('Ödeme hatası:', e); return [] }),
    ])
    // ...
  } catch (err) {
    setError('Veriler yüklenemedi. Lütfen sayfayı yenileyin.')
  } finally {
    setIsLoading(false)
  }
}
```

### 29.4 Değiştirilecek Dosyalar
- `project/frontend/pre-accounting-portal/src/features/sales-invoice/services/salesInvoiceService.ts`
- `project/frontend/pre-accounting-portal/src/features/sales-invoice/hooks/useSalesInvoiceData.ts`

### 29.5 Kabul Kriterleri
- [ ] Müşteri listesi düzgün yükleniyor
- [ ] Ürün listesi düzgün yükleniyor  
- [ ] Hata durumunda kullanıcı bilgilendiriliyor
- [ ] Loading state görünüyor

---

## Faz 30 - Katalog Modülü

### 30.1 Amaç
Tablet ve telefon üzerinden:
- Ürün görsellerini görme
- Ürün bilgilerini inceleme
- Hızlı sipariş oluşturma

### 30.2 ERPNext Kaynakları
- `Item` (ürün master)
- `Item Image` (ürün görseli)
- `Item Barcode` (barkod)
- `Item Group` (kategori)

### 30.3 Gerekli Ek Alanlar (Custom Fields)

| Alan Adı | DocType | Tip | Açıklama |
|----------|---------|-----|----------|
| `shelf_location` | Item | Data | Raf numarası |
| `units_per_carton` | Item | Int | Koli adedi |
| `packaging_type` | Item | Select | Ambalaj türü (Kutu, Poşet, Varil, Toplu) |
| `brand` | Item | Link > Brand | Marka |
| `catalog_description` | Item | Text | Katalog açıklaması |
| `image_url` | Item | Attach Image | Ana görsel |
| `barcode_list` | Item | Table > Item Barcode | Barkod listesi |

### 30.4 Ekran Tasarımı

#### 30.4.1 Katalog Ana Sayfa
```
┌─────────────────────────────────┐
│ 🔍 Ürün Ara                    │
├─────────────────────────────────┤
│ [Tümü] [Elektronik] [Gıda] ...  │  ← Kategori filtreleri
├─────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐        │
│ │  🖼️     │ │  🖼️     │        │
│ │ Resim   │ │ Resim   │        │
│ │         │ │         │        │
│ │ Ürün Ad │ │ Ürün Ad │        │
│ │ 99.90 ₺ │ │ 149.90₺ │        │
│ └─────────┘ └─────────┘        │
│                                 │
│ ┌─────────┐ ┌─────────┐        │
│ │  🖼️     │ │  🖼️     │        │
│ └─────────┘ └─────────┘        │
└─────────────────────────────────┘
```

#### 30.4.2 Ürün Detay Kartı
```
┌─────────────────────────────────┐
│ ← Geri                          │
├─────────────────────────────────┤
│        ┌─────────────┐          │
│        │             │          │
│        │   Görsel    │          │
│        │             │          │
│        └─────────────┘          │
│                                 │
│ Ürün Adı                       │
│ Kategori > Alt Kategori        │
├─────────────────────────────────┤
│ 💰 Fiyat        │  99.90 ₺      │
│ 📦 Stok         │  150 adet    │
│ 🗂️ Raf          │  A-12-3      │
│ 📊 Koli         │  24 adet     │
│ 📋 Barkod       │  869123456   │
│ 🏷️ Marka        │  ABC Marka   │
│ 📝 Ambalaj      │  Kutu        │
├─────────────────────────────────┤
│ Açıklama:                       │
│ Bu ürün kaliteli malzemeden... │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ [-]  1  [+]   _SEPETE EKLE │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 30.5 Özellikler

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Görsel slider | Çoklu görsel desteği | HIGH |
| Barkod tarama | Kamera ile barkod okuma | HIGH |
| Stok durumu | Anlık stok gösterimi | HIGH |
| Hızlı sepet | Ürün ekle butonu | HIGH |
| Arama | Kod, ad, barkod ile arama | HIGH |
| Filtreleme | Kategori, marka, fiyat | MEDIUM |
| Sıralama | Fiyat, ad, yeni eklenen | MEDIUM |
| Favoriler | Sık kullanılan ürünler | LOW |

### 30.6 Dosya Yapısı
```
src/
  features/
    catalog/
      components/
        CatalogScreen.tsx        # Ana katalog ekranı
        ProductCard.tsx          # Ürün kartı
        ProductDetailSheet.tsx   # Ürün detay sayfası
        BarcodeScanner.tsx       # Barkod tarayıcı
        QuickAddToCart.tsx       # Hızlı sepet ekle
      hooks/
        useCatalog.ts            # Veri hook
      services/
        catalogService.ts        # API servisleri
      types/
        index.ts                 # Tip tanımları
```

### 30.7 API Servisleri

```typescript
// catalogService.ts
export async function fetchCatalogItems(filters?: CatalogFilters) {
  return getResourceList<ItemRow>('Item', {
    fields: [
      'name', 'item_name', 'item_group', 'image',
      'stock_uom', 'brand', 'shelf_location',
      'units_per_carton', 'packaging_type',
      'standard_rate', 'qty'
    ],
    filters: [
      ['is_sales_item', '=', 1],
      ['disabled', '=', 0],
    ],
    orderBy: 'modified desc',
    limit: 200,
  })
}

export async function fetchItemBarcodes(itemCode: string) {
  return getResourceList<BarcodeRow>('Item Barcode', {
    fields: ['barcode', 'barcode_type'],
    filters: [['parent', '=', itemCode]],
  })
}
```

### 30.8 Feature Flag
```typescript
// config/featureFlags.ts
export const PRE_ACCOUNTING_FLAGS = {
  // ...
  'catalog.enabled': {
    group: 'Katalog',
    label: 'Katalog Modülü',
    default: true,
    description: 'Ürün katalog görünümü ve hızlı sipariş'
  },
  'catalog.show_images': {
    group: 'Katalog',
    label: 'Ürün Görselleri',
    default: true,
  },
  'catalog.barcode_scanner': {
    group: 'Katalog',
    label: 'Barkod Tarama',
    default: true,
  },
}
```

### 30.9 Route Ekleme
```typescript
// app/routes.ts
{
  path: '/katalog',
  component: lazy(() => import('../pages/catalog/CatalogPage')),
  settings: { requiredFeature: 'catalog.enabled' }
}
```

### 30.10 Kabul Kriterleri
- [ ] Ürünler grid görünümünde listeleniyor
- [ ] Ürün görselleri görünüyor
- [ ] Barkod, raf, koli, ambalaj bilgileri görünüyor
- [ ] Arama çalışıyor
- [ ] Kategori filtreleme çalışıyor
- [ ] Mobilde responsive görünüm
- [ ] Hızlı sepet ekleme çalışıyor

---

## Faz 31 - Rota Planı Modülü

### 31.1 Amaç
Saha satış ekibinin:
- Günlük müşteri ziyaret rotası oluşturma
- Güne başlama/günü bitirme kaydı
- Ziyaret takibi

### 31.2 ERPNext DocType Kaynakları
- `Employee` (satış temsilcisi)
- `Customer` (ziyaret edilecek müşteriler)
- Custom: `Route Plan` (rota kaydı)
- Custom: `Route Visit` (ziyaret kaydı)

### 31.3 Custom DocType Tasarımı

#### 31.3.1 Route Plan DocType
```python
# pre_accounting_app/doctype/route_plan/route_plan.py
class RoutePlan(Document):
    def validate(self):
        self.validate_dates()
        
    def validate_dates(self):
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                frappe.throw("Bitiş zamanı başlangıç zamanından sonra olmalıdır.")
```

**Fields:**
| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| name | Data | Evet | Rota adı |
| employee | Link > Employee | Evet | Satış temsilcisi |
| plan_date | Date | Evet | Planlanan tarih |
| start_time | Time | Evet | Gün başlangıç saati |
| end_time | Time | Evet | Gün bitiş saati |
| status | Select | Evet | Planlandı, Devam Ediyor, Tamamlandı, İptal |
| visits | Table | Hayır | Ziyaret listesi |
| notes | Text | Hayır | Notlar |
| start_location | Data | Hayır | Başlangıç konumu |
| end_location | Data | Hayır | Bitiş konumu |
| total_distance | Float | Hayır | Toplam km |
| customer_visits | Int | Hayır | Ziyaret edilen müşteri |

#### 31.3.2 Route Visit Child Table
| Alan | Tip | Açıklama |
|------|-----|----------|
| customer | Link > Customer | Müşteri |
| scheduled_time | Time | Planlanan saat |
| actual_time | Time | Gerçekleşen saat |
| status | Select | Beklemede, Yapıldı, İptal, Cevapsız |
| notes | Text | Ziyaret notu |
| order_taken | Check | Sipariş alındı |
| order_value | Currency | Sipariş tutarı |

### 31.4 Ekran Tasarımı

#### 31.4.1 Rota Listesi
```
┌─────────────────────────────────┐
│ 📋 Rota Planları                │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Bugün - 07 Mayıs 2026      │ │
│ │ ⏰ 09:00 - 18:00           │ │
│ │ 👤 Ahmet Yılmaz           │ │
│ │ 📊 8 müşteri / 5 ziyaret  │ │
│ │ [Başlat] [Düzenle]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Yarın - 08 Mayıs 2026      │ │
│ │ ⏰ 09:00 - 18:00           │ │
│ │ 👤 Ahmet Yılmaz           │ │
│ │ 📊 10 müşteri / 0 ziyaret │ │
│ │ [Planla]                  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### 31.4.2 Rota Detay / Aktif Rota
```
┌─────────────────────────────────┐
│ ← Geri        🔴 AKTİF ROTA    │
├─────────────────────────────────┤
│ 📅 07 Mayıs 2026               │
│ ⏰ Başlangıç: 09:15            │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 🏢 ABC Ticaret              │ │
│ │ 📍 Merkez Mah. No:5         │ │
│ │ ⏰ Plan: 09:30 │ Gerçek: 09:35│ │
│ │ [✅ Yapıldı] [📝 Not]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🏢 XYZ Market               │ │
│ │ 📍 Yeni Sk. No:12           │ │
│ │ ⏰ Plan: 10:00 │ Gerçek: - │ │
│ │ [⏳ Beklemede]              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🏢 123 Tekstil              │ │
│ │ 📍 Sanayi Bölgesi           │ │
│ │ ⏰ Plan: 11:00 │ Gerçek: - │ │
│ │ [⏳ Beklemede]              │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ [ROTAYI BİTİR]             │ │
│ │ Günü Kapat                 │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 31.5 Özellikler

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Rota oluşturma | Tarih, saat, müşteri seçimi | HIGH |
| Gün başlatma | Başlangıç saati ve konumu kaydet | HIGH |
| Ziyaret takibi | Müşteri bazlı ziyaret kaydı | HIGH |
| Günü bitirme | Bitiş saati ve özet kaydet | HIGH |
| Sipariş bağlantısı | Ziyaretten siparişe geçiş | MEDIUM |
| Harita görünümü | Müşteri lokasyonları | LOW |
| Raporlama | Günlük/haftalık özet | MEDIUM |

### 31.6 Dosya Yapısı
```
src/
  features/
    route-plan/
      components/
        RoutePlanListScreen.tsx   # Rota listesi
        RoutePlanDetailScreen.tsx # Rota detay
        ActiveRouteScreen.tsx     # Aktif rota ekranı
        CustomerVisitCard.tsx     # Müşteri ziyaret kartı
        StartDayModal.tsx         # Gün başlatma modal
        EndDayModal.tsx          # Günü bitirme modal
      hooks/
        useRoutePlan.ts
      services/
        routePlanService.ts
      types/
        index.ts
```

### 31.7 API Servisleri
```typescript
// routePlanService.ts
export async function createRoutePlan(form: RoutePlanForm) {
  return createResource<RoutePlanForm, { name: string }>('Route Plan', form)
}

export async function startDay(routePlanName: string, data: StartDayData) {
  return updateResource('Route Plan', routePlanName, {
    status: 'In Progress',
    actual_start_time: data.startTime,
    start_location: data.startLocation,
  })
}

export async function endDay(routePlanName: string, data: EndDayData) {
  return updateResource('Route Plan', routePlanName, {
    status: 'Completed',
    actual_end_time: data.endTime,
    end_location: data.endLocation,
    notes: data.notes,
  })
}

export async function fetchTodayRoute(employeeId: string) {
  const today = new Date().toISOString().slice(0, 10)
  const routes = await getResourceList<RoutePlanRow>('Route Plan', {
    filters: [
      ['employee', '=', employeeId],
      ['plan_date', '=', today],
    ],
    limit: 1,
  })
  return routes[0] || null
}
```

### 31.8 Feature Flags
```typescript
'route_plan.enabled': {
  group: 'Rota Planı',
  label: 'Rota Planı Modülü',
  default: true,
},
'route_plan.allow_start_day': {
  group: 'Rota Planı',
  label: 'Gün Başlatma',
  default: true,
},
'route_plan.allow_end_day': {
  group: 'Rota Planı',
  label: 'Günü Bitirme',
  default: true,
},
```

### 31.9 Backend (pre_accounting_app)
```python
# pre_accounting_app/doctype/route_plan/route_plan.py
import frappe
from frappe.model.document import Document

class RoutePlan(Document):
    def validate(self):
        self.validate_dates()
        self.validate_visits()
        
    def validate_dates(self):
        if self.start_time and self.end_time:
            start = frappe.utils.parse_datetime(f"{self.plan_date} {self.start_time}")
            end = frappe.utils.parse_datetime(f"{self.plan_date} {self.end_time}")
            if start >= end:
                frappe.throw("Bitiş zamanı başlangıç zamanından sonra olmalıdır.")
    
    def validate_visits(self):
        for visit in self.visits:
            if visit.scheduled_time and visit.actual_time:
                planned = frappe.utils.parse_datetime(f"{self.plan_date} {visit.scheduled_time}")
                actual = frappe.utils.parse_datetime(f"{self.plan_date} {visit.actual_time}")
                # Gecikme hesaplama yapılabilir

@frappe.whitelist()
def start_route_plan(route_plan_name: str, start_location: str = None):
    doc = frappe.get_doc('Route Plan', route_plan_name)
    doc.status = 'In Progress'
    doc.actual_start_time = frappe.utils.nowtime()
    if start_location:
        doc.start_location = start_location
    doc.save()
    frappe.db.commit()
    return doc

@frappe.whitelist()
def end_route_plan(route_plan_name: str, end_location: str = None, notes: str = None):
    doc = frappe.get_doc('Route Plan', route_plan_name)
    doc.status = 'Completed'
    doc.actual_end_time = frappe.utils.nowtime()
    if end_location:
        doc.end_location = end_location
    if notes:
        doc.notes = notes
    doc.save()
    frappe.db.commit()
    return doc
```

### 31.10 Routes
```typescript
// app/routes.ts
{
  path: '/rota-planlari',
  component: lazy(() => import('../pages/route-plan/RoutePlanListPage')),
  settings: { requiredFeature: 'route_plan.enabled' }
},
{
  path: '/rota/:id',
  component: lazy(() => import('../pages/route-plan/RoutePlanDetailPage')),
},
{
  path: '/aktif-rota',
  component: lazy(() => import('../pages/route-plan/ActiveRoutePage')),
},
```

### 31.11 Kabul Kriterleri
- [ ] Rota oluşturulabiliyor
- [ ] Gün başlatma çalışıyor
- [ ] Ziyaret takibi yapılabiliyor
- [ ] Gün bitirme çalışıyor
- [ ] Mobilde responsive görünüm
- [ ] Tarih ve saat filtreleri çalışıyor
- [ ] Özet rapor görüntülenebiliyor

---

## Genel Kabul Kriterleri (Tüm Fazlar)

### Kod Kalitesi
- [ ] ERPNext core değiştirilmedi
- [ ] Yeni DocType'lar custom app içinde
- [ ] Feature flag ile kontrol
- [ ] Türkçe UI metinleri
- [ ] Mobil-first responsive tasarım
- [ ] Component-first geliştirme
- [ ] Service/hook/component ayrımı

### Test
- [ ] `npm test -- --run` başarılı
- [ ] `npm run build` başarılı
- [ ] Playwright smoke test başarılı

### Git Akışı
- [ ] Feature branch oluşturuldu
- [ ] Commit mesajları anlamlı
- [ ] develop branch'e merge edildi

---

## Dosya Listesi (Tüm Değişiklikler)

### Frontend Dosyaları
```
project/frontend/pre-accounting-portal/src/
  features/
    sales-invoice/
      services/
        salesInvoiceService.ts     # [DEĞİŞTİ]
      hooks/
        useSalesInvoiceData.ts     # [DEĞİŞTİ]
    catalog/                       # [YENİ]
      components/
        CatalogScreen.tsx
        ProductCard.tsx
        ProductDetailSheet.tsx
        BarcodeScanner.tsx
        QuickAddToCart.tsx
      hooks/
        useCatalog.ts
      services/
        catalogService.ts
      types/
        index.ts
    route-plan/                    # [YENİ]
      components/
        RoutePlanListScreen.tsx
        RoutePlanDetailScreen.tsx
        ActiveRouteScreen.tsx
        CustomerVisitCard.tsx
        StartDayModal.tsx
        EndDayModal.tsx
      hooks/
        useRoutePlan.ts
      services/
        routePlanService.ts
      types/
        index.ts
  pages/
    catalog/
      CatalogPage.tsx
    route-plan/
      RoutePlanListPage.tsx
      RoutePlanDetailPage.tsx
      ActiveRoutePage.tsx
  config/
    featureFlags.ts                # [DEĞİŞTİ]
  app/
    routes.ts                      # [DEĞİŞTİ]
```

### Backend Dosyaları (pre_accounting_app)
```
apps/
  pre_accounting_app/
    pre_accounting_app/
      doctype/
        route_plan/                # [YENİ]
          route_plan.py
          route_plan.json
          route_plan_list.js
        route_visit/               # [YENİ]
          route_visit.json
```

### Memory Dosyaları
```
project/memory/
  pre-accounting-faz29-sales-data-master-fix-2026-05-07.md
  pre-accounting-faz30-catalog-module-2026-05-07.md
  pre-accounting-faz31-route-plan-module-2026-05-07.md
```

---

## Faz Sıralaması

| Faz | Konu | Öncelik | Tahmini Süre |
|-----|------|---------|--------------|
| 29 | Satış ekranı veri düzeltmesi | CRITICAL | 1 gün |
| 30 | Katalog modülü | HIGH | 3 gün |
| 31 | Rota planı modülü | HIGH | 4 gün |

---

*Son güncellenme: 2026-05-07*
*Hazırlayan: AI Agent*