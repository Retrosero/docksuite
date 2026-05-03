# Ön Muhasebe Faz 10.1 - Transfer Service Katmanı - 2026-05-03

## Yapılan
- `cash-bank` domain tipleri için merkezi `types.ts` eklendi.
- `cashBankTransferService.ts` eklendi:
  - `fetchTransferAccounts`
  - `fetchRecentTransfers`
  - `createInternalTransfer`
- Mevcut `cashBankService.ts` yeni tip sözleşmelerini kullanacak şekilde güncellendi.

## Teknik Karar
- Transfer kaydı için ERPNext standard `Payment Entry` ve `Internal Transfer` akışı kullanıldı.
- Service katmanı UI'dan bağımsız tutuldu; React Native geçişine uygun bir sözleşme bırakıldı.

## Sonraki Adım
- Faz 10.2: transfer form hook'u ve validasyon katmanı.
