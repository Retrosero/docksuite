export type CashBankAccountType = 'Bank' | 'Cash'

export type CashBankAccount = {
  name: string
  account_name?: string
  account_type?: CashBankAccountType
  company?: string
}

export type CashBankBalanceRow = CashBankAccount & {
  balance: number
}

export type GlEntryRow = {
  account?: string
  debit?: number
  credit?: number
}

export type CashBankSummaryData = {
  rows: CashBankBalanceRow[]
  totalCash: number
  totalBank: number
}

export type CashBankTransferRecord = {
  name: string
  posting_date?: string
  paid_from?: string
  paid_to?: string
  paid_amount?: number
  received_amount?: number
  company?: string
  docstatus?: number
}

export type CashBankTransferDraft = {
  posting_date: string
  paid_from: string
  paid_to: string
  paid_amount: number
  company: string
  mode_of_payment?: string
  reference_no?: string
  reference_date?: string
  remarks?: string
}

export type BankStatementRow = {
  date: string
  description: string
  amount: number
}

export type BankReconciliationMatch = {
  statement: BankStatementRow
  paymentEntryName?: string
  party?: string
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

export type BankReconciliationEvent = {
  name: string
  confirmed_at?: string
  confirmed_by?: string
  statement_date?: string
  statement_description?: string
  statement_amount?: number
  payment_entry_name?: string
  confidence?: 'high' | 'medium' | 'low'
  reason?: string
}
