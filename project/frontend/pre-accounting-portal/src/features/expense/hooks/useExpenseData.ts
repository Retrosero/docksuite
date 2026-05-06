import { useEffect, useState } from 'react'
import { fetchApprovalStates } from '../../approvals/services/approvalService'
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
      const [invoiceStates, paymentStates] = await Promise.all([
        fetchApprovalStates('purchase_invoice', invoiceRows.map((row) => row.name)),
        fetchApprovalStates('payment_entry', paymentRows.map((row) => row.name)),
      ])
      setPurchaseInvoices(invoiceRows.map((row) => ({ ...row, approval_status: invoiceStates[row.name] })))
      setSupplierPayments(paymentRows.map((row) => ({ ...row, approval_status: paymentStates[row.name] })))
      setSuppliers(supplierRows.map((row) => ({ name: row.name, label: row.supplier_name || row.name })))
      setItems(itemRows.map((row) => ({ name: row.name, label: row.item_name || row.name })))
      setModes(modeRows.map((row) => ({ name: row.name, label: row.name })))
    } catch {
      setError('Gider ve ödeme verileri alınamadı.')
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
      setError('Alış faturası oluşturulamadı.')
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
      setError('Tedarikçi ödemesi oluşturulamadı.')
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
