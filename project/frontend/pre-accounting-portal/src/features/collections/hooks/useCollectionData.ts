import { useEffect, useState } from 'react'
import {
  createCollectionEntry,
  fetchCollectionCustomers,
  fetchModesOfPayment,
  fetchOpenSalesInvoices,
  fetchPaymentEntries,
} from '../services/collectionService'
import type { OpenSalesInvoiceItem, PaymentEntryForm, PaymentEntryItem } from '../types'

type NamedOption = { name: string; label: string }

export function useCollectionData() {
  const [entries, setEntries] = useState<PaymentEntryItem[]>([])
  const [customers, setCustomers] = useState<NamedOption[]>([])
  const [modes, setModes] = useState<NamedOption[]>([])
  const [openInvoices, setOpenInvoices] = useState<OpenSalesInvoiceItem[]>([])
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [entryRows, customerRows, modeRows] = await Promise.all([
        fetchPaymentEntries(),
        fetchCollectionCustomers(),
        fetchModesOfPayment(),
      ])
      setEntries(entryRows)
      setCustomers(customerRows.map((row) => ({ name: row.name, label: row.customer_name || row.name })))
      setModes(modeRows.map((row) => ({ name: row.name, label: row.name })))
    } catch {
      setError('Tahsilat verileri alinamadi.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const loadOpenInvoices = async (customer: string) => {
    setIsLoadingInvoices(true)
    try {
      const invoices = await fetchOpenSalesInvoices(customer)
      setOpenInvoices(invoices)
    } catch {
      setError('Acik fatura listesi alinamadi.')
      setOpenInvoices([])
    } finally {
      setIsLoadingInvoices(false)
    }
  }

  const saveCollection = async (form: PaymentEntryForm): Promise<string | null> => {
    setIsSaving(true)
    setError(null)
    try {
      const name = await createCollectionEntry(form)
      await load()
      return name
    } catch {
      setError('Tahsilat kaydi olusturulamadi. ERP hesap ayarlarinizi kontrol edin.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  return { entries, customers, modes, openInvoices, isLoadingInvoices, isLoading, isSaving, error, saveCollection, loadOpenInvoices }
}
