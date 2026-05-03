import { getResourceList } from '../../../services/erpApi'
import type { CashBankAccount, CashBankSummaryData, GlEntryRow } from '../types'

export async function fetchCashBankData(): Promise<CashBankSummaryData> {
  const [accounts, entries] = await Promise.all([
    getResourceList<CashBankAccount>('Account', {
      fields: ['name', 'account_name', 'account_type'],
      filters: [['account_type', 'in', ['Bank', 'Cash']]],
      limit: 200,
      orderBy: 'modified desc',
    }),
    getResourceList<GlEntryRow>('GL Entry', {
      fields: ['account', 'debit', 'credit'],
      limit: 1500,
      orderBy: 'posting_date desc',
    }),
  ])

  const balanceMap = new Map<string, number>()
  for (const row of entries) {
    if (!row.account) continue
    balanceMap.set(row.account, (balanceMap.get(row.account) ?? 0) + (row.debit ?? 0) - (row.credit ?? 0))
  }

  const rows = accounts.map((account) => ({
    ...account,
    balance: balanceMap.get(account.name) ?? 0,
  }))

  const totalCash = rows.filter((row) => row.account_type === 'Cash').reduce((a, b) => a + b.balance, 0)
  const totalBank = rows.filter((row) => row.account_type === 'Bank').reduce((a, b) => a + b.balance, 0)

  return { rows, totalCash, totalBank }
}
