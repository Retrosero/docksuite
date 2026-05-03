import { useEffect, useMemo, useState } from 'react'
import { validateCashBankTransferForm } from '../../../shared/utils/formValidation'
import {
  createInternalTransfer,
  fetchRecentTransfers,
  fetchTransferAccounts,
} from '../services/cashBankTransferService'
import type { CashBankAccount, CashBankTransferDraft, CashBankTransferRecord } from '../types'

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function buildInitialDraft(): CashBankTransferDraft {
  return {
    posting_date: getTodayIsoDate(),
    paid_from: '',
    paid_to: '',
    paid_amount: 0,
    company: '',
    mode_of_payment: '',
    reference_no: '',
    reference_date: '',
    remarks: '',
  }
}

export function useCashBankTransfer() {
  const [accounts, setAccounts] = useState<CashBankAccount[]>([])
  const [recentTransfers, setRecentTransfers] = useState<CashBankTransferRecord[]>([])
  const [draft, setDraft] = useState<CashBankTransferDraft>(buildInitialDraft)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([fetchTransferAccounts(), fetchRecentTransfers(20)])
      .then(([loadedAccounts, loadedTransfers]) => {
        if (!active) return
        setAccounts(loadedAccounts)
        setRecentTransfers(loadedTransfers)

        const firstCompany = loadedAccounts.find((row) => row.company)?.company ?? ''
        setDraft((prev) => ({
          ...prev,
          company: prev.company || firstCompany,
        }))
      })
      .catch(() => {
        if (active) setError('Transfer verileri alınamadı.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const setField = <K extends keyof CashBankTransferDraft>(key: K, value: CashBankTransferDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
    setSubmitSuccessMessage(null)
  }

  const formError = useMemo(() => validateCashBankTransferForm(draft), [draft])

  const submitTransfer = async (): Promise<boolean> => {
    const validationError = validateCashBankTransferForm(draft)
    if (validationError) {
      setError(validationError)
      return false
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const created = await createInternalTransfer(draft)
      const refreshedTransfers = await fetchRecentTransfers(20)
      setRecentTransfers(refreshedTransfers)
      setSubmitSuccessMessage(`${created.name} numaralı transfer kaydedildi.`)
      setDraft((prev) => ({
        ...buildInitialDraft(),
        company: prev.company,
      }))
      return true
    } catch {
      setError('Transfer kaydı oluşturulamadı.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    accounts,
    recentTransfers,
    draft,
    isLoading,
    isSubmitting,
    error,
    formError,
    submitSuccessMessage,
    setField,
    submitTransfer,
  }
}
