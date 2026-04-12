# AGENTS.md

Bu proje ERPNext + Frappe tabanlı sektör uygulamaları geliştirmek için hazırlanmıştır.

## Proje Amacı
Bu proje, ERPNext ve Frappe çekirdeğini arka ofis ve veri omurgası olarak kullanıp, sektörlere özel sade ve modern kullanıcı arayüzleri geliştirmek için tasarlanmıştır.

İlk hedef sektör:
- tersane / yat üretimi / saha operasyonları

İleride aynı mimariyle farklı sektörler de geliştirilebilir:
- oyuncak
- yeme içme
- diğer dikey sektörler

---

## Temel Mimari
- ERPNext = çekirdek arka ofis ve veri omurgası
- Frappe HR = HR + Payroll çekirdeği
- custom apps = sektör bazlı iş mantığı
- özel frontend = sade kullanıcı deneyimi
- tüm özel sektör mantıkları core sistemden ayrıştırılmış şekilde geliştirilmelidir

---

## Zorunlu Okuma Sırası
Her yeni özellik, geliştirme, refactor veya teknik karar öncesinde mutlaka şu klasörleri oku:

1. `rules/`
2. `docs/erpnext/`
3. `memory/`

**Always read `rules/`, `docs/erpnext/`, and `memory/` before implementing any feature.**

Bu kontrol yapılmadan doğrudan geliştirmeye başlanmamalıdır.

---

## Değiştirilmeyecekler
Aşağıdaki çekirdek yapılar doğrudan değiştirilmemelidir:

- `frappe` core
- `erpnext` core
- `hrms` / `frappe hr` core

Bu sistemler üçüncü parti çekirdek gibi ele alınmalıdır.

---

## Özel Geliştirme Alanları
Özel geliştirmeler yalnızca aşağıdaki alanlarda yapılmalıdır:

- `project/apps/core_app`
- `project/apps/shipyard_app`
- `project/frontend/shipyard-portal`
- `project/docs`
- `project/rules`
- `project/skills`
- `project/specs`
- `project/memory`

---

## Altın Geliştirme Kuralları

### 1. Önce standard çözümü tüket
Yeni bir ihtiyaç geldiğinde şu sırayla düşün:

1. ERPNext / Frappe standardı yeterli mi?
2. Yetmiyorsa Custom Field yeterli mi?
3. Yetmiyorsa yeni DocType gerekir mi?
4. Yetmiyorsa custom app içinde özel iş mantığı yazılmalı mı?

Doğrudan özel geliştirmeye atlanmamalıdır.

---

### 2. Veri tek kaynakta tutulmalı
- Tek gerçek veri kaynağı ERPNext / Frappe olmalıdır.
- Aynı veri ikinci bir yerde tutulmamalıdır.
- Duplicate veri oluşturulmamalıdır.
- Frontend sadece kullanım deneyimini sadeleştirmelidir.

---

### 3. Frontend iş mantığını kopyalamamalı
Frontend:
- ERPNext iş mantığını yeniden yazmamalı
- sadece veri girişini ve görüntülemeyi sadeleştirmeli
- role-based deneyim sağlamalı
- mobil kullanım kolaylığı sunmalı

---

### 4. Multi-tenant yaklaşım sabittir
Üretimde her müşteri şu yapıda çalışacaktır:

- ayrı subdomain
- ayrı site
- ayrı veritabanı
- ortak kod tabanı

Örnek:
- `firma1.satsatoyuncak.com`
- `firma2.satsatoyuncak.com`

Bu yapı korunmalıdır.

---

## Tasarım ve Arayüz Kuralları

### 1. Tüm uygulama tamamen Türkçe olmalı
- Arayüz metinleri Türkçe olmalıdır
- Butonlar, formlar, menüler, başlıklar, hata mesajları Türkçe olmalıdır
- Teknik terimler mümkün olduğunca kullanıcı dostu Türkçe karşılıklarla verilmelidir

### 2. Uygulama hem web hem de %100 mobil uyumlu olmalı
- Tüm yeni ekranlar mobile-first yaklaşımıyla düşünülmelidir
- Telefon ekranında rahat kullanılmalıdır
- Tablet kullanımına uygun olmalıdır
- Masaüstünde de düzenli görünmelidir

### 3. Kullanıcı deneyimi sade olmalı
Özellikle hedef kullanıcılar:
- işçi
- formen
- mühendis
- saha personeli
- yönetici

Bu nedenle ekranlar:
- sade
- anlaşılır
- az alanla veri girişi yapılabilen
- hızlı aksiyon alınabilen
yapıda tasarlanmalıdır.

### 4. ERP karmaşası kullanıcıya yansıtılmamalı
Karmaşık ERP ekranlarını son kullanıcıya göstermemek temel hedeftir.
Özel frontend:
- daha sade
- daha hızlı
- daha görev odaklı
olmalıdır.

---

## Kod ve Yapı Kuralları

### 1. Component mantığı korunmalı
Kod modüler olmalı:
- tekrar kullanılabilir bileşenler
- feature bazlı yapı
- service katmanı
- type tanımları ayrı
- UI ve business logic ayrılmış

### 2. API kullanımı merkezi olmalı
- API çağrıları component içine dağılmamalı
- service katmanında toplanmalı
- field label ile field name karıştırılmamalı
- minimum payload ile başlanmalı

### 3. Yeni özellik geliştirirken önce mevcut yapıyı kontrol et
Geliştirme öncesi:
- mevcut DocType var mı?
- mevcut custom field var mı?
- benzer API var mı?
- memory dosyalarında daha önce tanımlanmış mı?

kontrol edilmelidir.

---

## DocType Karar Kuralı
Bir veri için şu mantık kullanılmalıdır:

### Custom Field
Eğer veri:
- mevcut kaydın ek özelliği ise
- tekil bir nitelik ise
- geçmiş/hareket kaydı değilse

→ `Custom Field`

### New DocType
Eğer veri:
- tekrar eden işlem ise
- geçmiş kaydı ise
- ayrı liste/form gerektiriyorsa
- kendi akışı ve izinleri olacaksa

→ `New DocType`

---

## Çalışma Sırası
Her görevde aşağıdaki sırayı izle:

1. görevi analiz et
2. ilgili `rules/` dosyalarını oku
3. ilgili `docs/erpnext/` notlarını oku
4. `memory/` dosyalarını kontrol et
5. standard mı custom mı karar ver
6. etkilenecek dosyaları listele
7. geliştirmeyi yap
8. kısa teknik özet bırak

---

## Shipyard Özel Öncelikleri
İlk sektör olan tersane için öncelikli modüller:

- görev yönetimi
- ekip / atama
- vardiya / attendance kullanım ekranları
- malzeme talep
- zimmet
- saha bildirim
- teknik doküman görüntüleme

Bu modüller geliştirilirken:
- çekirdek ERPNext / Frappe yapıları korunmalı
- sadece gerekli özel katmanlar oluşturulmalı

---

## Beklenen Davranış
Geliştirme yaparken:
- aceleyle kod yazma
- önce sistem mantığını doğrula
- önce mevcut yapıyı kontrol et
- çekirdeği bozma
- sade, Türkçe ve mobil uyumlu sonuç üret
- bakım ve güncelleme kolaylığını her zaman gözet

---

## Son Kural
Bu projede amaç sadece çalışan kod yazmak değildir.

Amaç:
- sürdürülebilir
- ürünleşebilir
- çok kiracılı yapıya uygun
- ERPNext ile uyumlu
- Türkçe
- mobil uyumlu
bir sektör platformu oluşturmaktır.