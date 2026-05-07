import { useEffect, useState } from 'react'
import { fetchApprovalStates } from '../../approvals/services/approvalService'
import {
  createSalesInvoice,
  createSalesQuotation,
  fetchModeOfPayments,
  fetchSalesCustomers,
  fetchSalesInvoices,
  fetchSalesItems,
  fetchSalesQuotations,
} from '../services/salesInvoiceService'
import type { SalesInvoiceForm, SalesInvoiceItem, SalesQuotationForm, SalesQuotationItem } from '../types'

type NamedOption = { name: string; label: string }

export function useSalesInvoiceData() {
  const [invoices, setInvoices] = useState<SalesInvoiceItem[]>([])
  const [quotations, setQuotations] = useState<SalesQuotationItem[]>([])
  const [customers, setCustomers] = useState<NamedOption[]>([])
  const [items, setItems] = useState<NamedOption[]>([])
  const [modeOfPayments, setModeOfPayments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingQuotation, setIsSavingQuotation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [invoiceRows, quotationRows, customerRows, itemRows, modeRows] = await Promise.all([
        fetchSalesInvoices().catch(() => []),
        fetchSalesQuotations().catch(() => []),
        fetchSalesCustomers().catch(() => []),
        fetchSalesItems().catch(() => []),
        fetchModeOfPayments().catch(() => []),
      ])
      if (invoiceRows.length === 0 && quotationRows.length === 0 && customerRows.length === 0 && itemRows.length === 0 && modeRows.length === 0) {
        throw new Error('Satis ekrani verileri alinamadi')
      }
      const states = await fetchApprovalStates('sales_invoice', invoiceRows.map((row) => row.name))
      setInvoices(invoiceRows.map((row) => ({ ...row, approval_status: states[row.name] })))
      setQuotations(quotationRows)
      setCustomers(customerRows.map((row) => ({ name: row.name, label: row.customer_name || row.name })))
      setItems(itemRows.map((row) => ({ name: row.name, label: row.item_name || row.name })))
      setModeOfPayments(modeRows.map((row) => row.name))
    } catch {
      setError('Satis faturasi verileri alinamadi.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const saveInvoice = async (form: SalesInvoiceForm): Promise<string | null> => {
    setIsSaving(true)
    setError(null)
    try {
      const name = await createSalesInvoice(form)
      await load()
      return name
    } catch {
      setError('Satis faturasi olusturulamadi. Musteri, sepet ve odeme bilgilerini kontrol edin.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const saveQuotation = async (form: SalesQuotationForm): Promise<string | null> => {
    setIsSavingQuotation(true)
    setError(null)
    try {
      const name = await createSalesQuotation(form)
      await load()
      return name
    } catch {
      setError('Satis teklifi olusturulamadi. Musteri, urun, fiyat ve gecerlilik tarihini kontrol edin.')
      return null
    } finally {
      setIsSavingQuotation(false)
    }
  }

  return { invoices, quotations, customers, items, modeOfPayments, isLoading, isSaving, isSavingQuotation, error, saveInvoice, saveQuotation }
}
