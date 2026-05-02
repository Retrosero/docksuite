import { createResource, getResourceList } from '../../../services/erpApi'
import type { SalesInvoiceForm, SalesInvoiceItem } from '../types'

type CustomerRow = {
  name: string
  customer_name?: string
}

type ItemRow = {
  name: string
  item_name?: string
}

export async function fetchSalesInvoices(): Promise<SalesInvoiceItem[]> {
  return getResourceList<SalesInvoiceItem>('Sales Invoice', {
    fields: ['name', 'customer', 'customer_name', 'grand_total', 'outstanding_amount', 'docstatus'],
    orderBy: 'modified desc',
    limit: 50,
  })
}

export async function fetchSalesCustomers(): Promise<CustomerRow[]> {
  return getResourceList<CustomerRow>('Customer', {
    fields: ['name', 'customer_name'],
    orderBy: 'modified desc',
    limit: 100,
  })
}

export async function fetchSalesItems(): Promise<ItemRow[]> {
  return getResourceList<ItemRow>('Item', {
    fields: ['name', 'item_name'],
    filters: [['disabled', '=', 0]],
    orderBy: 'modified desc',
    limit: 100,
  })
}

export async function createSalesInvoice(form: SalesInvoiceForm): Promise<string> {
  const created = await createResource<
    { customer: string; due_date: string; items: Array<{ item_code: string; qty: number; rate: number }> },
    { name?: string }
  >('Sales Invoice', {
    customer: form.customer,
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
