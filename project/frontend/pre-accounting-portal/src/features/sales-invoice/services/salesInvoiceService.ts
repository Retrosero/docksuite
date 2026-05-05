import { createResource, getResourceList } from '../../../services/erpApi'
import type {
  EDocumentReadinessSummary,
  SalesInvoiceForm,
  SalesInvoiceItem,
  SalesQuotationForm,
  SalesQuotationItem,
  SalesReturnReadinessSummary,
} from '../types'

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
    fields: [
      'name',
      'customer',
      'customer_name',
      'grand_total',
      'outstanding_amount',
      'posting_date',
      'is_return',
      'return_against',
      'docstatus',
    ],
    orderBy: 'modified desc',
    limit: 50,
  })
}

export function buildEDocumentReadinessSummary(invoices: SalesInvoiceItem[]): EDocumentReadinessSummary {
  const readyInvoices = invoices.filter((invoice) => invoice.docstatus === 1)
  const draftCount = invoices.filter((invoice) => invoice.docstatus !== 1).length

  return {
    readyCount: readyInvoices.length,
    draftCount,
    totalAmount: readyInvoices.reduce((total, invoice) => total + (invoice.grand_total ?? 0), 0),
    latestReadyInvoice: readyInvoices[0]?.name,
  }
}

export function buildSalesReturnReadinessSummary(invoices: SalesInvoiceItem[]): SalesReturnReadinessSummary {
  const returnableInvoices = invoices.filter((invoice) => invoice.docstatus === 1 && invoice.is_return !== 1)
  const returnInvoices = invoices.filter((invoice) => invoice.is_return === 1)
  const draftCount = invoices.filter((invoice) => invoice.docstatus !== 1).length

  return {
    returnableCount: returnableInvoices.length,
    returnInvoiceCount: returnInvoices.length,
    draftCount,
    latestReturnableInvoice: returnableInvoices[0]?.name,
  }
}

export async function fetchSalesQuotations(): Promise<SalesQuotationItem[]> {
  return getResourceList<SalesQuotationItem>('Quotation', {
    fields: ['name', 'party_name', 'customer_name', 'transaction_date', 'valid_till', 'grand_total', 'status', 'docstatus'],
    filters: [['quotation_to', '=', 'Customer']],
    orderBy: 'modified desc',
    limit: 30,
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

export async function createSalesQuotation(form: SalesQuotationForm): Promise<string> {
  const created = await createResource<
    {
      quotation_to: 'Customer'
      party_name: string
      transaction_date: string
      valid_till: string
      items: Array<{ item_code: string; qty: number; rate: number }>
    },
    { name?: string }
  >('Quotation', {
    quotation_to: 'Customer',
    party_name: form.customer,
    transaction_date: new Date().toISOString().slice(0, 10),
    valid_till: form.validTill,
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
