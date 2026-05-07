import { erpPost, getResourceList } from '../../../services/erpApi'
import type { BankReconciliationEvent, BankReconciliationMatch, BankStatementRow } from '../types'

type PaymentEntryRow = {
  name: string
  posting_date?: string
  paid_amount?: number
  received_amount?: number
  party?: string
  reference_no?: string
  remarks?: string
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function parseAmount(raw: string): number {
  const normalized = raw
    .trim()
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '')
  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : 0
}

export function parseBankStatementCsv(content: string): BankStatementRow[] {
  const rows = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (rows.length < 2) return []

  const separator = rows[0].includes(';') ? ';' : ','
  const header = rows[0].split(separator).map((cell) => normalizeText(cell))
  const dateIndex = header.findIndex((cell) => cell.includes('tarih') || cell.includes('date'))
  const descriptionIndex = header.findIndex(
    (cell) => cell.includes('aciklama') || cell.includes('description') || cell.includes('islem'),
  )
  const amountIndex = header.findIndex(
    (cell) => cell.includes('tutar') || cell.includes('amount') || cell.includes('net'),
  )

  if (dateIndex < 0 || descriptionIndex < 0 || amountIndex < 0) return []

  return rows.slice(1).map((line) => {
    const cells = line.split(separator)
    return {
      date: (cells[dateIndex] || '').trim(),
      description: (cells[descriptionIndex] || '').trim(),
      amount: parseAmount(cells[amountIndex] || '0'),
    }
  }).filter((row) => row.date && row.description && row.amount !== 0)
}

function scoreMatch(statement: BankStatementRow, entry: PaymentEntryRow): { score: number; reason: string } {
  const statementText = normalizeText(statement.description)
  const entryReference = normalizeText(entry.reference_no || '')
  const entryRemarks = normalizeText(entry.remarks || '')
  const entryDate = entry.posting_date || ''
  const entryAmount = Math.max(Math.abs(entry.paid_amount || 0), Math.abs(entry.received_amount || 0))
  const statementAmount = Math.abs(statement.amount)

  let score = 0
  let reason = 'Tutar benzerligi dusuk'

  const amountDiff = Math.abs(statementAmount - entryAmount)
  if (amountDiff < 0.01) {
    score += 70
    reason = 'Tutar birebir eslesiyor'
  } else if (amountDiff < 5) {
    score += 50
    reason = 'Tutar yakin eslesiyor'
  }

  if (statement.date === entryDate) score += 20

  if (entryReference && statementText.includes(entryReference)) {
    score += 20
    reason = 'Aciklama + referans eslesiyor'
  } else if (entryRemarks && statementText.includes(entryRemarks.slice(0, Math.min(entryRemarks.length, 8)))) {
    score += 10
  }

  return { score, reason }
}

function toConfidence(score: number): 'high' | 'medium' | 'low' {
  if (score >= 85) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

export async function buildBankReconciliationMatches(
  statementRows: BankStatementRow[],
): Promise<BankReconciliationMatch[]> {
  const paymentEntries = await getResourceList<PaymentEntryRow>('Payment Entry', {
    fields: ['name', 'posting_date', 'paid_amount', 'received_amount', 'party', 'reference_no', 'remarks'],
    orderBy: 'posting_date desc',
    limit: 500,
  })

  return statementRows.map((statement) => {
    let best: { entry?: PaymentEntryRow; score: number; reason: string } = { score: 0, reason: 'Eslesme bulunamadi' }

    for (const entry of paymentEntries) {
      const { score, reason } = scoreMatch(statement, entry)
      if (score > best.score) {
        best = { entry, score, reason }
      }
    }

    if (!best.entry || best.score < 45) {
      return {
        statement,
        confidence: 'low',
        reason: 'Eslesme bulunamadi',
      }
    }

    return {
      statement,
      paymentEntryName: best.entry.name,
      party: best.entry.party,
      confidence: toConfidence(best.score),
      reason: best.reason,
    }
  })
}

type ConfirmMatchPayload = {
  statement_date: string
  statement_description: string
  statement_amount: number
  payment_entry_name: string
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

export async function confirmBankReconciliationMatch(payload: ConfirmMatchPayload): Promise<void> {
  await erpPost<{ message?: { status?: string } }, ConfirmMatchPayload>(
    '/method/shipyard_app.stabilization.confirm_bank_reconciliation_match',
    payload,
  )
}

type RecentEventsResponse = {
  message?: {
    items?: BankReconciliationEvent[]
    count?: number
  }
}

export async function getRecentBankReconciliationEvents(limit = 10): Promise<BankReconciliationEvent[]> {
  const response = await erpPost<RecentEventsResponse, { limit: number }>(
    '/method/shipyard_app.stabilization.get_recent_bank_reconciliation_events',
    { limit },
  )
  return response.message?.items ?? []
}
