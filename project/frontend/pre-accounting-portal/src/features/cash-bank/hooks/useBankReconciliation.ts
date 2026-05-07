import { useEffect, useState } from 'react'
import type { BankReconciliationEvent, BankReconciliationMatch } from '../types'
import {
  buildBankReconciliationMatches,
  confirmBankReconciliationMatch,
  getRecentBankReconciliationEvents,
  parseBankStatementCsv,
} from '../services/bankReconciliationService'

export function useBankReconciliation() {
  const [matches, setMatches] = useState<BankReconciliationMatch[]>([])
  const [confirmedIndexes, setConfirmedIndexes] = useState<number[]>([])
  const [recentEvents, setRecentEvents] = useState<BankReconciliationEvent[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reconcileStatement = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    try {
      const content = await file.text()
      const rows = parseBankStatementCsv(content)
      if (!rows.length) {
        setMatches([])
        setError('Ekstre formati okunamadi. CSV basliklari: tarih, aciklama, tutar olmalidir.')
        return
      }
      const result = await buildBankReconciliationMatches(rows)
      setMatches(result)
      setConfirmedIndexes([])
    } catch {
      setError('Mutabakat dosyasi islenemedi.')
      setMatches([])
      setConfirmedIndexes([])
    } finally {
      setIsProcessing(false)
    }
  }

  const refreshRecentEvents = async () => {
    try {
      const rows = await getRecentBankReconciliationEvents(10)
      setRecentEvents(rows)
    } catch {
      // Silent fallback for non-critical panel.
    }
  }

  useEffect(() => {
    void refreshRecentEvents()
  }, [])

  const confirmMatch = async (index: number) => {
    const match = matches[index]
    if (!match?.paymentEntryName) return
    setIsConfirming(true)
    try {
      await confirmBankReconciliationMatch({
        statement_date: match.statement.date,
        statement_description: match.statement.description,
        statement_amount: match.statement.amount,
        payment_entry_name: match.paymentEntryName,
        confidence: match.confidence,
        reason: match.reason,
      })
      setConfirmedIndexes((prev) => (prev.includes(index) ? prev : [...prev, index]))
      await refreshRecentEvents()
    } catch {
      setError('Mutabakat onayi kaydedilemedi.')
    } finally {
      setIsConfirming(false)
    }
  }

  return { matches, confirmedIndexes, recentEvents, isProcessing, isConfirming, error, reconcileStatement, confirmMatch }
}
