# Ön Muhasebe Faz 31 - Rota Planı Modülü - 2026-05-07

## Kapsam
Saha satış ekibi için günlük müşteri ziyaret rotası oluşturma, güne başlama ve günü bitirme sistemi.

## Modül Özellikleri

### Temel Fonksiyonlar
- Rota planı oluşturma
- Güne başlama (başlangıç saati ve konumu kaydetme)
- Müşteri ziyaret takibi
- Günü bitirme (bitiş saati ve özet kaydetme)
- Ziyaret notları
- Sipariş bağlantısı

### Ekranlar
1. **Rota Listesi** - Planlanmış rotalar, bugün/yarın/yaklaşan
2. **Rota Detay** - Ziyaret listesi, durum takibi
3. **Aktif Rota** - Güncel ziyaret, başlat/bitir butonları

## ERPNext Kaynakları
- `Employee` - Satış temsilcisi
- `Customer` - Müşteriler
- Custom: `Route Plan` - Rota kaydı
- Custom: `Route Visit` - Ziyaret kaydı (child table)

## Custom DocType: Route Plan

### Fields
| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| name | Data | Evet | Rota adı |
| employee | Link > Employee | Evet | Satış temsilcisi |
| plan_date | Date | Evet | Planlanan tarih |
| start_time | Time | Evet | Gün başlangıç saati |
| end_time | Time | Evet | Gün bitiş saati |
| status | Select | Evet | Planlandı/Devam Ediyor/Tamamlandı/İptal |
| notes | Text | Hayır | Notlar |
| start_location | Data | Hayır | Başlangıç konumu |
| end_location | Data | Hayır | Bitiş konumu |

### Child Table: Route Visit
| Alan | Tip | Açıklama |
|------|-----|----------|
| customer | Link > Customer | Müşteri |
| scheduled_time | Time | Planlanan saat |
| actual_time | Time | Gerçekleşen saat |
| status | Select | Beklemede/Yapıldı/İptal/Cevapsız |
| notes | Text | Ziyaret notu |
| order_taken | Check | Sipariş alındı |
| order_value | Currency | Sipariş tutarı |

## Dosya Yapısı
```
src/features/route-plan/
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
```

## Backend (pre_accounting_app)
```
apps/pre_accounting_app/pre_accounting_app/doctype/
  route_plan/
    route_plan.py
    route_plan.json
    route_plan_list.js
  route_visit/
    route_visit.json
```

## Feature Flags
- `route_plan.enabled` - Rota planı modülü
- `route_plan.allow_start_day` - Gün başlatma
- `route_plan.allow_end_day` - Günü bitirme

## Routes
- `/rota-planlari` - Rota listesi
- `/rota/:id` - Rota detay
- `/aktif-rota` - Aktif rota

## Öncelik Sırası
1. Backend DocType oluşturma
2. Rota listesi ekranı
3. Rota detay ve ziyaret takibi
4. Gün başlatma/bitirme modalları
5. Aktif rota ekranı

## Doğrulama
- Rota oluşturulabiliyor
- Gün başlatma çalışıyor
- Ziyaret takibi yapılabiliyor
- Gün bitirme çalışıyor
- Mobil responsive