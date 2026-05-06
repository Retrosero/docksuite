# Faz J - NES Portal Gelen/Giden Belge Merkezi (2026-05-06)

## Kapsam
NES Portal API katmanı üzerinden gelen ve giden e-Belge (e-Fatura, e-Arşiv, e-İrsaliye) işlemlerinin merkezi yönetimi.

## Hedefler
- Gönderilen belgelerin durum takibi ve listesi
- Gelen belgelerin görüntülenmesi
- Red, iptal, iade operasyonları
- Webhook/callback kayıtlarının izlenmesi
- Tekrar gönderim desteği

---

## Teknik Analiz

### Mevcut Durum (Faz I)
Faz I'de şunlar yapıldı:
- Sales Invoice üzerinde NES Portal custom field'ları
- `pre_accounting_nes_portal.py`: temel gönderim ve durum sorgulama
- Config tabanlı endpoint yönetimi

### Eksik Bileşenler
1. **Gelen belge listesi** - Alınan e-Belgelerin takibi
2. **Webhook endpoint'i** - NES'ten gelen callback'lerin yakalanması
3. **Operasyon aksiyonları** - Red/iptal/iade/tekrar gönderim
4. **Belge geçmişi** - Timeline tablosu

---

## Backend Implementasyonu

### 1. DocType: NES Portal Document Log
```
Alanlar:
- document_type: Select (e-Fatura, e-Arşiv, e-İrsaliye)
- direction: Select (Outgoing, Incoming)
- erp_document_type: Link (Sales Invoice, Purchase Invoice, vb.)
- erp_document_name: Data
- nes_uuid: Data
- nes_status: Select (Queued, Sent, Accepted, Rejected, Cancelled, Error)
- direction_status: Select (Gönderildi, Teslim Alındı, Okundu, Reddedildi)
- raw_request: Code (JSON)
- raw_response: Code (JSON)
- error_message: Small Text
- callback_received_at: Datetime
- last_sync_at: Datetime
- metadata: JSON
```

### 2. Webhook Endpoint
```python
@frappe.whitelist(allow_guest=True)
def nes_portal_webhook():
    # Gelen callback'i işle
    # Belge durumunu güncelle
    # Log kaydı oluştur
```

### 3. Operasyon API'leri
```python
@frappe.whitelist()
def reject_nes_document(document_name, reason)

@frappe.whitelist()
def cancel_nes_document(document_name, reason)

@frappe.whitelist()
def return_nes_document(document_name, reason)

@frappe.whitelist()
def resend_nes_document(document_name)
```

### 4. Belge Listesi API'leri
```python
@frappe.whitelist()
def get_sent_documents(filters)  # Giden belgeler

@frappe.whitelist()
def get_received_documents(filters)  # Gelen belgeler

@frappe.whitelist()
def get_document_history(document_name)  # Belge geçmişi
```

---

## Frontend Implementasyonu

### 1. E-Document Center Page
```
src/pages/e-belge/eDocumentCenter/
├── eDocumentCenterPage.tsx      # Ana sayfa
├── components/
│   ├── DocumentTabs.tsx         # Giden/Gelen sekmeleri
│   ├── DocumentFilter.tsx       # Filtreler
│   ├── DocumentList.tsx         # Liste görünümü
│   ├── DocumentCard.tsx         # Kart görünümü
│   ├── DocumentStatus.tsx      # Durum rozeti
│   └── DocumentActions.tsx      # Aksiyon butonları
├── services/
│   └── eDocumentService.ts     # API çağrıları
└── types.ts                    # Tip tanımları
```

### 2. Belge Detay Modalı
- Belge bilgileri
- Timeline (durum geçmişi)
- Aksiyonlar (Red, İptal, İade, Tekrar Gönder)

### 3. E-Belge Servis Metodları
```typescript
export async function getSentDocuments(filters)
export async function getReceivedDocuments(filters)
export async function getDocumentHistory(documentName)
export async function rejectDocument(documentName, reason)
export async function cancelDocument(documentName, reason)
export async function returnDocument(documentName, reason)
export async function resendDocument(documentName)
export async function syncDocumentStatus(documentName)
```

---

## Route Ekleme
```typescript
// routes.ts
{ key: 'e-belge', label: 'E-Belge', path: '/e-belge', component: EDocumentCenterPage, allowedTemplates: ['yonetici', 'muhasebe_sorumlusu'] }
```

---

## Sonraki Faz
Faz K: Mali Müşavir ve Muhasebe Aktarım Merkezi (Luca, Zirve, Orka, Datasoft aktarım paketleri)