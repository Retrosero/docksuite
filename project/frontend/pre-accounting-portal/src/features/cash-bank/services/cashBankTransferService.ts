import { createResource, getResourceList } from '../../../services/erpApi'
import type { CashBankAccount, CashBankTransferDraft, CashBankTransferRecord } from '../types'

type PaymentEntryCreatePayload = {
  payment_type: 'Internal Transfer'
  posting_date: string
  paid_from: string
  paid_to: string
  paid_amount: number
  received_amount: number
  company: string
  mode_of_payment?: string
  reference_no?: string
  reference_date?: string
  remarks?: string
}

function toTransferPayload(draft: CashBankTransferDraft): PaymentEntryCreatePayload {
  return {
    payment_type: 'Internal Transfer',
    posting_date: draft.posting_date,
    paid_from: draft.paid_from,
    paid_to: draft.paid_to,
    paid_amount: draft.paid_amount,
    received_amount: draft.paid_amount,
    company: draft.company,
    mode_of_payment: draft.mode_of_payment,
    reference_no: draft.reference_no,
    reference_date: draft.reference_date,
    remarks: draft.remarks,
  }
}

export async function fetchTransferAccounts(): Promise<CashBankAccount[]> {
  return getResourceList<CashBankAccount>('Account', {
    fields: ['name', 'account_name', 'account_type', 'company'],
    filters: [['account_type', 'in', ['Bank', 'Cash']]],
    limit: 300,
    orderBy: 'modified desc',
  })
}

export async function fetchRecentTransfers(limit = 20): Promise<CashBankTransferRecord[]> {
  return getResourceList<CashBankTransferRecord>('Payment Entry', {
    fields: ['name', 'posting_date', 'paid_from', 'paid_to', 'paid_amount', 'received_amount', 'company', 'docstatus'],
    filters: [['payment_type', '=', 'Internal Transfer']],
    limit,
    orderBy: 'posting_date desc',
  })
}

export async function createInternalTransfer(draft: CashBankTransferDraft): Promise<CashBankTransferRecord> {
  return createResource<PaymentEntryCreatePayload, CashBankTransferRecord>('Payment Entry', toTransferPayload(draft))
}
