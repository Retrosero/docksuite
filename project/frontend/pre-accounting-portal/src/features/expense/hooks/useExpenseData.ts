import { useEffect, useState } from 'react'
import {
  createPurchaseInvoice,
  createSupplierPayment,
  fetchItems,
  fetchModesOfPayment,
  fetchPurchaseInvoices,
  fetchSupplierPayments,
  fetchSuppliers,
} from '../services/expenseService'
import type { ExpenseForm, PurchaseInvoiceItem, SupplierPaymentForm, SupplierPaymentItem } from '../types'

type NamedOption = { name: string; label: string }

export function useExpenseData() {
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoiceItem[]>([])
  const [supplierPayments, setSupplierPayments] = useState<SupplierPaymentItem[]>([])
  const [suppliers, setSuppliers] = useState<NamedOption[]>([])
  const [items, setItems] = useState<NamedOption[]>([])
  const [modes, setModes] = useState<NamedOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [invoiceRows, paymentRows, supplierRows, itemRows, modeRows] = await Promise.all([
        fetchPurchaseInvoices(),
        fetchSupplierPayments(),
        fetchSuppliers(),
        fetchItems(),
        fetchModesOfPayment(),
      ])
      setPurchaseInvoices(invoiceRows)
      setSupplierPayments(paymentRows)
      setSuppliers(supplierRows.map((row) => ({ name: row.name, label: row.supplier_name || row.name })))
      setItems(itemRows.map((row) => ({ name: row.name, label: row.item_name || row.name })))
      setModes(modeRows.map((row) => ({ name: row.name, label: row.name })))
    } catch {
      setError('Gider ve odeme verileri alinamadi.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const savePurchaseInvoice = async (form: ExpenseForm) => {
    setIsSaving(true)
    setError(null)
    try {
      const name = await createPurchaseInvoice(form)
      await load()
      return name
    } catch {
      setError('Alis faturasi olusturulamadi.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const saveSupplierPayment = async (form: SupplierPaymentForm) => {
    setIsSaving(true)
    setError(null)
    try {
      const name = await createSupplierPayment(form)
      await load()
      return name
    } catch {
      setError('Tedarikci odemesi olusturulamadi.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  return {
    purchaseInvoices,
    supplierPayments,
    suppliers,
    items,
    modes,
    isLoading,
    isSaving,
    error,
    savePurchaseInvoice,
    saveSupplierPayment,
  }
}
