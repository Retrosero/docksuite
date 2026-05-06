# Faz K - Mali Müşavir ve Muhasebe Aktarım Merkezi (2026-05-06)

## Kapsam
ERPNext'teki mali verilerin muhasebe yazılımlarına (Luca, Zirve, Orka, Datasoft) aktarımı için merkezi yönetim.

## Hedefler
- Çoklu muhasebe yazılımı desteği (Luca, Zirve, Orka, Datasoft)
- Dönem bazlı aktarım paketi oluşturma
- Aktarım gecmişi ve hata raporu
- Standart muhasebe formatlarına dönüştürme
- SaaS uyumlu - tenant başına ayar

---

## Teknik Analiz

### Hedef Sistemler
| Sistem | Format | Özellikler |
|--------|--------|------------|
| Luca | XML/CSV | Cari, Fatura, Çek/Senet |
| Zirve | XML | Cari, Fatura, Makbuz |
| Orka | CSV | Cari, Fatura, Stok |
| Datasoft | DBF/CSV | Cari, Fatura |

### Temel Varlıklar
1. **Transfer Config** - Her tenant için hedef sistem ayarları
2. **Transfer Package** - Oluşturulan aktarım paketleri
3. **Transfer Log** - Aktarım geçmişi ve hataları

---

## Backend Implementasyonu

### 1. DocType: Transfer Config
```
Alanlar:
- software: Select (Luca, Zirve, Orka, Datasoft)
- export_path: Data
- date_format: Data
- currency_code: Data
- include_cancelled: Check
- active: Check
```

### 2. DocType: Transfer Package
```
Alanlar:
- software: Link (Transfer Config)
- period_start: Date
- period_end: Date
- document_types: Table
- status: Select (Draft, Ready, Exported, Error)
- file_path: Data
- record_count: Int
- error_count: Int
```

### 3. API Fonksiyonları
```python
@frappe.whitelist()
def get_transfer_software_list()

@frappe.whitelist()
def create_transfer_package(software, period_start, period_end, document_types)

@frappe.whitelist()
def export_package(package_name, format)

@frappe.whitelist()
def get_transfer_history(limit)

@frappe.whitelist()
def get_transfer_errors(package_name)
```

### 4. Format Dönüştürücüler
```python
def to_luca_format(invoices) -> XML/CSV
def to_zirve_format(invoices) -> XML
def to_orka_format(invoices) -> CSV
def to_datasoft_format(invoices) -> DBF/CSV
```

---

## Frontend Implementasyonu

### 1. Transfer Center Page
```
src/pages/aktarim/
├── TransferCenterPage.tsx    # Ana sayfa
├── components/
│   ├── SoftwareSelector.tsx  # Yazılım seçici
│   ├── PeriodPicker.tsx      # Dönem seçici
│   ├── DocumentTypeList.tsx  # Belge türleri
│   ├── PackageList.tsx       # Paket listesi
│   └── ExportButton.tsx      # Dışa aktar
└── services/
    └── transferService.ts
```

### 2. Transfer Servis Metodları
```typescript
export async function getTransferSoftwareList()
export async function createTransferPackage(software, periodStart, periodEnd, documentTypes)
export async function exportPackage(packageId, format)
export async function getTransferHistory()
```

---

## Route Ekleme
```typescript
// routes.ts
{ key: 'aktarim', label: 'Aktarım', path: '/aktarim', component: TransferCenterPage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu'] }
```

---

## Sonraki Faz
Faz L: Gelişmiş Dashboard & KPI Raporlama (Gerçek zamanlı, interaktif grafikler)