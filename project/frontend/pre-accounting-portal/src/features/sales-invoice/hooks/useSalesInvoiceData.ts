import { useEffect, useState } from 'react'
import {
  createSalesInvoice,
  createSalesQuotation,
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
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingQuotation, setIsSavingQuotation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [invoiceRows, quotationRows, customerRows, itemRows] = await Promise.all([
        fetchSalesInvoices(),
        fetchSalesQuotations(),
        fetchSalesCustomers(),
        fetchSalesItems(),
      ])
      setInvoices(invoiceRows)
      setQuotations(quotationRows)
      setCustomers(customerRows.map((row) => ({ name: row.name, label: row.customer_name || row.name })))
      setItems(itemRows.map((row) => ({ name: row.name, label: row.item_name || row.name })))
    } catch {
      setError('Satış faturası verileri alınamadı.')
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
      setError('Satış faturası oluşturulamadı. Müşteri, ürün ve fiyat bilgilerini kontrol edin.')
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
      setError('Satış teklifi oluşturulamadı. Müşteri, ürün, fiyat ve geçerlilik tarihini kontrol edin.')
      return null
    } finally {
      setIsSavingQuotation(false)
    }
  }

  return { invoices, quotations, customers, items, isLoading, isSaving, isSavingQuotation, error, saveInvoice, saveQuotation }
}
