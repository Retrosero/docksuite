# Ön Muhasebe Faz 23 - Onay Akışları - 2026-05-05

## Kapsam
Yüksek tutarlı işlemler için onay zinciri ve onay bekleyen işler paneli.

## Teknik Not
- Approval Request DocType ile onay kayıtları tutulur
- Backend API: onay oluşturma, onaylama, reddetme
- Frontend: onay bekleyen paneli
- Onay limiti aşan işlemler otomatik onay talebi oluşturur

## Onay Kuralları
| Tutar Aralığı | Onay Gereken Mi? | Onaylayıcı |
|---------------|------------------|-------------|
| 0 - 10.000 TL | Hayır | - |
| 10.001 - 50.000 TL | Evet (opsiyonel) | Muhasebe Sorumlusu |
| 50.001 - 100.000 TL | Evet | Yönetici |
| 100.001+ TL | Evet | Yönetici + Sistem Yöneticisi |

## DocType: Approval Request
- document_type: Sales Invoice, Payment Entry, vb.
- document_name: Belge adı
- amount: Tutar
- requested_by: İsteyen kullanıcı
- status: Pending / Approved / Rejected
- approval_level: 1, 2, 3
- approved_by: Onaylayan kullanıcı
- approved_at: Onay zamanı
- rejection_reason: Red sebebi

## Doğrulama
- `npm run -s build`
- Onay paneli listeleme testi
