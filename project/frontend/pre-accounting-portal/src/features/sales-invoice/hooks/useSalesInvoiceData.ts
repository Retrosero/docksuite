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
      // Her API çağrısını ayrı try-catch ile yap - biri başarısız olsa diğerleri devam etsin
      let invoiceRows: SalesInvoiceItem[] = []
      let quotationRows: SalesQuotationItem[] = []
      let customerRows: Array<{ name: string; customer_name?: string }> = []
      let itemRows: Array<{ name: string; item_name?: string }> = []
      let modeRows: Array<{ name: string }> = []

      // Faturalar
      try {
        invoiceRows = await fetchSalesInvoices()
      } catch (e) {
        console.error('Fatura listesi alınamadı:', e)
      }

      // Teklifler
      try {
        quotationRows = await fetchSalesQuotations()
      } catch (e) {
        console.error('Teklif listesi alınamadı:', e)
      }

      // Müşteriler
      try {
        customerRows = await fetchSalesCustomers()
      } catch (e) {
        console.error('Müşteri listesi alınamadı:', e)
      }

      // Ürünler
      try {
        itemRows = await fetchSalesItems()
      } catch (e) {
        console.error('Ürün listesi alınamadı:', e)
      }

      // Ödeme yöntemleri
      try {
        modeRows = await fetchModeOfPayments()
      } catch (e) {
        console.error('Ödeme yöntemleri alınamadı:', e)
      }

      // En az bir kritik veri var mı kontrol et (müşteri veya ürün)
      const hasCriticalData = customerRows.length > 0 || itemRows.length > 0

      if (!hasCriticalData) {
        console.warn('Müşteri veya ürün verisi bulunamadı. ERPNext bağlantısını kontrol edin.')
        // Hata fırlatma yerine uyarı ver ve devam et
      }

      // Onay durumlarını getir
      if (invoiceRows.length > 0) {
        try {
          const states = await fetchApprovalStates('sales_invoice', invoiceRows.map((row) => row.name))
          setInvoices(invoiceRows.map((row) => ({ ...row, approval_status: states[row.name] })))
        } catch {
          setInvoices(invoiceRows)
        }
      } else {
        setInvoices([])
      }

      setQuotations(quotationRows)
      setCustomers(customerRows.map((row) => ({ name: row.name, label: row.customer_name || row.name })))
      setItems(itemRows.map((row) => ({ name: row.name, label: row.item_name || row.name })))
      setModeOfPayments(modeRows.map((row) => row.name))

      // Eğer tüm veriler boşsa kullanıcıya bilgi ver
      if (!hasCriticalData) {
        setError('Müşteri veya ürün verisi bulunamadı. Lütfen ERPNext\'te veri olduğunu kontrol edin.')
      }

    } catch (err) {
      console.error('Satış ekranı veri yükleme hatası:', err)
      setError('Satış ekranı verileri yüklenemedi. Lütfen sayfayı yenileyin.')
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
      setError('Satış faturası oluşturulamadı. Müşteri, sepet ve ödeme bilgilerini kontrol edin.')
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

  return { invoices, quotations, customers, items, modeOfPayments, isLoading, isSaving, isSavingQuotation, error, saveInvoice, saveQuotation }
}