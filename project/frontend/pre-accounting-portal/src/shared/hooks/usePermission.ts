import type { RoleTemplateKey } from '../../app/routes'

export type ActionKey = 
  | 'create_sales_invoice'
  | 'submit_sales_invoice'
  | 'cancel_sales_invoice'
  | 'create_purchase_invoice'
  | 'submit_purchase_invoice'
  | 'create_payment_entry'
  | 'submit_payment_entry'
  | 'create_transfer'
  | 'submit_transfer'
  | 'create_expense'
  | 'submit_expense'
  | 'manage_users'
  | 'update_settings'

export type AmountLimit = {
  action: ActionKey
  limit: number
  label: string
}

export const AMOUNT_LIMITS: AmountLimit[] = [
  { action: 'submit_sales_invoice', limit: 50000, label: 'Satış faturası onay' },
  { action: 'submit_payment_entry', limit: 50000, label: 'Tahsilat onay' },
  { action: 'create_transfer', limit: 25000, label: 'Transfer oluştur' },
  { action: 'submit_expense', limit: 25000, label: 'Gider onay' },
]

export function hasWritePermission(roleTemplate: RoleTemplateKey | null): boolean {
  return roleTemplate !== null && roleTemplate !== 'salt_okuma'
}

export function getAmountLimitForAction(action: ActionKey): number | null {
  const limitEntry = AMOUNT_LIMITS.find((l) => l.action === action)
  return limitEntry?.limit ?? null
}

export function formatAmountLimit(limit: number): string {
  return new Intl.NumberFormat('tr-TR').format(limit)
}

export function getLimitExceededMessage(action: ActionKey): string {
  const limitEntry = AMOUNT_LIMITS.find((l) => l.action === action)
  if (!limitEntry) return ''
  return `${limitEntry.label} için yetkiniz yok. Tutar sınırı: ${formatAmountLimit(limitEntry.limit)} TL`
}
