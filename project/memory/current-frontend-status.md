# Current Frontend Status

## Faz 4 Baslangici
- Tarih: 2026-04-13
- Workspace: `project/frontend/shipyard-portal`
- Durum: ilk operasyon ekranlari baslatildi

## Mevcut yapi
- Vite + React + TypeScript iskeleti eklendi
- mobile-first operasyon dashboard'u aciliyor
- tenant-safe config `src/config/tenant.ts` icinde tutuluyor
- dashboard verisi simdilik mock snapshot olarak feature klasorunde tutuluyor
- operasyon akislari `src/features/operations` altinda ilk kez modelleniyor
- Flowbite MIT component dili, operasyon ekranlarinda oncelikli tasarim referansi olarak kullaniliyor
- sayfa bazli rotalar `/`, `/gorevler`, `/ekipler`, `/saha-bildirimi`, `/zimmet`, `/attendance` olarak ayrildi

## Sonraki teknik adimlar
1. auth/bootstrap akisi
2. ERPNext REST client
3. operasyon ekranlarini gercek veri ile beslemek
4. gorev / ekip / saha bildirim / zimmet / attendance ayrik feature'larini olgunlastirmak
5. Flowbite benzeri shared component wrapper'larini standartlastirmak

## Not
- Bu katman ERPNext core'dan ayrik tutulur.
- Marka ve tenant farklari config/theme token ile yonetilecektir.

## Shift Tracking Page (2026-04-13)
- `/attendance` rotasi mock snapshot'tan cikarilip API-driven hale getirildi.
- Yeni feature katmani: `src/features/attendance` (types + service + hook + component yapisi).
- ERPNext kaynaklari:
  - `GET /api/resource/Shift Type`
  - `GET /api/resource/Attendance` (bugun filtresi + status/shift filtreleri)
  - `GET /api/resource/Employee` (ekip/unvan baglami icin)
- Ekran davranisi:
  - bugunku vardiya ozet kartlari
  - calisan bazli liste + status etiketleri
  - formen gorunumu (ekip bazli ozet)
  - calisan gorunumu (oturum employee kaydina sade filtre)
- UI metinleri Turkce ve ekran mobile-first grid yapisina gore guncellendi.

## Shift Tracking Role Access (2026-04-13)
- Backend endpoint eklendi: `shipyard_app.platform.api.get_session_actor_context`
- Endpoint, oturum kullanicisinin rollerine gore vardiya gorunumu erisimini doner:
  - `can_view_foreman`
  - `can_view_worker`
  - `default_mode`
- Frontend `attendance` ekrani bu endpoint ile varsayilan modu otomatik secer.
- Formen yetkisi yoksa toggle gizlenir ve ekran dogrudan calisan gorunumunde acilir.

## Stock Page (2026-04-13)
- `/stok` rotasi eklendi (domain capability: `stok`).
- Yeni feature katmani: `src/features/stock` (types + service + hook + component yapisi).
- ERPNext kaynaklari:
  - `GET /api/resource/Item` (liste, alan bazli cekim + filtreler)
  - `GET /api/resource/Bin` (item bazli stok miktari ozeti)
  - `GET /api/method/frappe.client.get_meta` (opsiyonel alan varligi kontrolu)
- Ekran davranisi:
  - mobilde kart gorunumu, masaustunde tablo gorunumu
  - barkod, urun adi, item group, `shipyard_secondary_aisle` ve kritik stok etiketi
  - urun grubu + arama + kritik stok filtreleri
  - `is_critical_stock` alani tenant'ta yoksa filtre guvenli sekilde devre disi
- UI metinleri Turkce ve ekran mobile-first yapida tasarlandi.

## Attendance Last-30-Days Update (2026-04-19)
- `Vardiya Takibi` veri stratejisi sadece bugun filtresinden cikarildi.
- Attendance sorgusu son 30 gun (`attendance_date >= today-30`) kapsayacak sekilde guncellendi.
- Tarih etiketi, veri varsa en guncel attendance gununu gosteriyor; veri yoksa `Son 30 gunde kayit yok` metni donuyor.
- Worker modunda kullanici-email/employee eslesmesi yoksa liste bosaltilmiyor; genel liste + bilgilendirme notu gosteriliyor.

## Shift Planning Demo Note Update (2026-04-19)
- Shift planning data cevabina `demoAutoAssignmentCount` eklendi.
- Ilk yuklemede demo otomatik vardiya atamasi varsa bilgi notu gosteriliyor.

## Attendance Loading + Employee Name Fix (2026-04-19)
- `ShiftTrackingScreen` icinde filter nesnesi `useMemo` ile sabitlendi.
- Boylece her render'da yeni filter referansi uretilip sonsuz yukleme dongusu olusmasi engellendi.
- Loading metni yalnizca ilk veri yuklenirken gosterilecek sekilde guncellendi.
- Shift planning assignment satirlarinda `employee_name` bos ise employee map uzerinden ad resolve edilerek gun detayinda kod yerine ad gosterimi saglandi.
