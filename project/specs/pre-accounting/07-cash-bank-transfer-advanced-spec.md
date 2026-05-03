# Ön Muhasebe Faz 10 - Kasa/Banka Transfer (Gelişmiş Spec)

## Amaç
Kullanıcının kasa ve banka hesapları arasında transfer işlemini mobil uyumlu, Türkçe ve tenant kontrollü bir akışla ERPNext standard kayıtlarına yazmak.

## Hedef
- Mevcut `Kasa/Banka` ekranını sadece bakiye izleme seviyesinden işlem yapabilen seviyeye taşımak.
- Transfer işlemini ERPNext standard DocType kullanarak kaydetmek.
- Plan/tenant/ayar kontrollü görünürlük ve davranış sağlamak.

## Kapsam
1. Transfer formu (kaynak hesap, hedef hesap, tutar, tarih, açıklama)
2. Transfer kaydetme
3. Son transfer kayıtları listesi
4. Form doğrulama ve Türkçe hata mesajları
5. Ayar kontrollü görünürlük

## ERPNext Kaynakları
- `Payment Entry` (tercihli akış)
- `Account`
- `Mode of Payment`
- `Company`
- (Opsiyonel fallback) `Journal Entry`

## Kural
- Önce standard API ve standard kayıt deseni.
- Core dosyalara müdahale yok.
- Aynı veri ikinci yerde tutulmaz.

## İş Akışı
1. Kullanıcı kaynak hesabı seçer (`Cash` veya `Bank`).
2. Kullanıcı hedef hesabı seçer (`Cash` veya `Bank`, kaynakla aynı olamaz).
3. Tutar ve tarih girer.
4. Kaydet ile transfer `Payment Entry` olarak oluşturulur.
5. Kayıt sonrası son transfer listesi yenilenir.

## API Sözleşmesi

### Okuma
- `GET /api/resource/Account`:
  - filtre: `account_type in [Cash, Bank]`
  - alanlar: `name, account_name, account_type, company`

- `GET /api/resource/Payment Entry`:
  - filtre: `payment_type = Internal Transfer` (veya sistemdeki transfer karşılığı)
  - alanlar: `name, posting_date, paid_from, paid_to, paid_amount, company, docstatus`
  - sıralama: `posting_date desc`

### Yazma
- `POST /api/resource/Payment Entry`
  - minimum alanlar:
    - `payment_type`
    - `posting_date`
    - `paid_from`
    - `paid_to`
    - `paid_amount`
    - `received_amount`
    - `company`
    - `mode_of_payment` (zorunluysa)

## Frontend Mimari

### Service
- `features/cash-bank/services/cashBankTransferService.ts`
  - `fetchTransferAccounts()`
  - `fetchRecentTransfers()`
  - `createInternalTransfer(payload)`

### Hook
- `features/cash-bank/hooks/useCashBankTransfer.ts`
  - form state
  - submit state
  - doğrulama
  - başarılı kayıt sonrası liste yenileme

### UI
- `features/cash-bank/components/CashBankTransferPanel.tsx`
  - mobile-first form
  - yükleniyor / hata / boş durumları
  - son transferler listesi

## Ayar Anahtarları
- `cash_bank.show_internal_transfer_panel` (default: `true`)
- `cash_bank.show_recent_transfer_list` (default: `true`)

Not:
- Bu anahtarlar mevcut ayar metadata listesine eklenecek.
- Plan kapsamı başlangıçta: `ticari`, `mobil`.

## Doğrulama Kuralları
1. Kaynak hesap zorunlu.
2. Hedef hesap zorunlu.
3. Kaynak ve hedef aynı olamaz.
4. Tutar `> 0` olmalı.
5. Tarih zorunlu.
6. Company boş olamaz.

## Mobil UX Kuralları
1. Form tek kolonda akmalı.
2. Birincil aksiyon butonu sabit ve görünür olmalı.
3. Hata metinleri alanın yakınında kısa Türkçe verilmeli.
4. Başarılı kayıt sonrası kullanıcıya kısa işlem özeti gösterilmeli.

## Güvenlik ve Tenant
1. Tenant hardcode yok.
2. `X-Frappe-Site-Name` üzerinden aktif site kullanılmalı.
3. Plan dışı durumda panel pasif/gizli olmalı.
4. Backend doğrulama başarısızsa kullanıcıya sade Türkçe hata gösterilmeli.

## Fazlara Bölünmüş Uygulama Sırası

### Faz 10.1 - Domain ve Service Katmanı
- transfer tipleri
- account + transfer liste okuma
- create transfer API çağrısı

### Faz 10.2 - Form ve Validasyon
- transfer formu
- alan doğrulamaları
- submit ve hata yönetimi

### Faz 10.3 - Liste ve Kapanış Akışı
- son transferler listesi
- kayıt sonrası otomatik yenileme
- mobil görünüm iyileştirme

### Faz 10.4 - Ayar/Plan Entegrasyonu
- yeni feature flag anahtarları
- ayarlar ekranı metadata güncellemesi
- plan bazlı görünürlük/pasif davranış

### Faz 10.5 - Stabilizasyon
- testler
- build
- memory/spec kapanış notu

## Kabul Kriterleri
1. Transfer kaydı ERPNext standard kaynağa yazılır.
2. Mobilde form ve liste taşmadan çalışır.
3. Ayar kapalıysa panel görünmez/pasif olur.
4. Plan dışı tenantlarda transfer aksiyonu açılamaz.
5. Test + build başarılıdır.
6. Spec ve memory günceldir.
