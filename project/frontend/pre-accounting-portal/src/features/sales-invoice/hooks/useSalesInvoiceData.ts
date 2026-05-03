import { useEffect, useState } from 'react'
import { createSalesInvoice, fetchSalesCustomers, fetchSalesInvoices, fetchSalesItems } from '../services/salesInvoiceService'
import type { SalesInvoiceForm, SalesInvoiceItem } from '../types'

type NamedOption = { name: string; label: string }

export function useSalesInvoiceData() {
  const [invoices, setInvoices] = useState<SalesInvoiceItem[]>([])
  const [customers, setCustomers] = useState<NamedOption[]>([])
  const [items, setItems] = useState<NamedOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [invoiceRows, customerRows, itemRows] = await Promise.all([
        fetchSalesInvoices(),
        fetchSalesCustomers(),
        fetchSalesItems(),
      ])
      setInvoices(invoiceRows)
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

  return { invoices, customers, items, isLoading, isSaving, error, saveInvoice }
}
