import { createResource, getResourceList } from '../../../services/erpApi'
import type { ExpenseForm, PurchaseInvoiceItem, SupplierPaymentForm, SupplierPaymentItem } from '../types'

type SupplierRow = {
  name: string
  supplier_name?: string
}

type ItemRow = {
  name: string
  item_name?: string
}

type ModeRow = {
  name: string
}

export async function fetchPurchaseInvoices(): Promise<PurchaseInvoiceItem[]> {
  return getResourceList<PurchaseInvoiceItem>('Purchase Invoice', {
    fields: ['name', 'supplier', 'supplier_name', 'grand_total', 'outstanding_amount', 'due_date', 'docstatus'],
    orderBy: 'modified desc',
    limit: 50,
  })
}

export async function fetchSupplierPayments(): Promise<SupplierPaymentItem[]> {
  return getResourceList<SupplierPaymentItem>('Payment Entry', {
    fields: ['name', 'party', 'paid_amount', 'mode_of_payment', 'docstatus'],
    filters: [
      ['payment_type', '=', 'Pay'],
      ['party_type', '=', 'Supplier'],
    ],
    orderBy: 'modified desc',
    limit: 50,
  })
}

export async function fetchSuppliers(): Promise<SupplierRow[]> {
  return getResourceList<SupplierRow>('Supplier', {
    fields: ['name', 'supplier_name'],
    orderBy: 'modified desc',
    limit: 100,
  })
}

export async function fetchItems(): Promise<ItemRow[]> {
  return getResourceList<ItemRow>('Item', {
    fields: ['name', 'item_name'],
    filters: [['disabled', '=', 0]],
    orderBy: 'modified desc',
    limit: 100,
  })
}

export async function fetchModesOfPayment(): Promise<ModeRow[]> {
  return getResourceList<ModeRow>('Mode of Payment', {
    fields: ['name'],
    orderBy: 'modified desc',
    limit: 50,
  })
}

export async function createPurchaseInvoice(form: ExpenseForm): Promise<string> {
  const created = await createResource<
    {
      supplier: string
      posting_date: string
      due_date: string
      items: Array<{ item_code: string; qty: number; rate: number }>
    },
    { name?: string }
  >('Purchase Invoice', {
    supplier: form.supplier,
    posting_date: new Date().toISOString().slice(0, 10),
    due_date: new Date().toISOString().slice(0, 10),
    items: [
      {
        item_code: form.itemCode,
        qty: form.qty,
        rate: form.rate,
      },
    ],
  })
  return String(created.name ?? '')
}

export async function createSupplierPayment(form: SupplierPaymentForm): Promise<string> {
  const created = await createResource<
    {
      payment_type: string
      party_type: string
      party: string
      paid_amount: number
      received_amount: number
      mode_of_payment: string
      posting_date: string
    },
    { name?: string }
  >('Payment Entry', {
    payment_type: 'Pay',
    party_type: 'Supplier',
    party: form.supplier,
    paid_amount: form.paidAmount,
    received_amount: form.paidAmount,
    mode_of_payment: form.modeOfPayment,
    posting_date: new Date().toISOString().slice(0, 10),
  })
  return String(created.name ?? '')
}
