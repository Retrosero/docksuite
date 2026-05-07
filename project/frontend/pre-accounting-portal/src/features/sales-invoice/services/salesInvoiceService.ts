import { createResource, getResourceList } from '../../../services/erpApi'
import { registerTransactionForApproval } from '../../approvals/services/approvalTriggerService'
import type {
  EDocumentReadinessSummary,
  QuotationConversionSummary,
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
  standard_rate?: number
}

type ModeOfPaymentRow = {
  name: string
}

function getDefaultDueDate(paymentType: SalesInvoiceForm['paymentType']): string {
  if (paymentType === 'Vadeli') {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().slice(0, 10)
  }
  return new Date().toISOString().slice(0, 10)
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

export function buildQuotationConversionSummary(quotations: SalesQuotationItem[]): QuotationConversionSummary {
  const convertedStatuses = new Set(['Ordered', 'Converted', 'Invoiced'])
  const convertibleQuotations = quotations.filter((quotation) => {
    if (quotation.docstatus !== 1) return false
    if (!quotation.status) return true
    return !convertedStatuses.has(quotation.status)
  })

  return {
    convertibleCount: convertibleQuotations.length,
    convertedCount: quotations.filter((quotation) => quotation.status ? convertedStatuses.has(quotation.status) : false).length,
    draftCount: quotations.filter((quotation) => quotation.docstatus !== 1).length,
    latestConvertibleQuotation: convertibleQuotations[0]?.name,
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
    filters: [['disabled', '!=', 1]],
    orderBy: 'customer_name asc',
    limit: 200,
  })
}

export async function fetchSalesItems(): Promise<ItemRow[]> {
  return getResourceList<ItemRow>('Item', {
    fields: ['name', 'item_name', 'standard_rate'],
    filters: [['disabled', '!=', 1]],
    orderBy: 'item_name asc',
    limit: 200,
  })
}

export async function fetchModeOfPayments(): Promise<ModeOfPaymentRow[]> {
  return getResourceList<ModeOfPaymentRow>('Mode of Payment', {
    fields: ['name'],
    orderBy: 'name asc',
    limit: 50,
  })
}

export async function createSalesInvoice(form: SalesInvoiceForm): Promise<string> {
  const calculatedGrandTotal = form.items.reduce((sum, line) => {
    const lineTotal = line.qty * line.rate
    const discountAmount = lineTotal * (line.discountPercent / 100)
    return sum + (lineTotal - discountAmount)
  }, 0)
  const dueDate = form.dueDate || getDefaultDueDate(form.paymentType)
  const modeOfPayment = form.paymentType === 'Vadeli' ? null : (form.modeOfPayment || null)

  const created = await createResource<
    {
      customer: string
      due_date: string
      is_pos: 0 | 1
      mode_of_payment?: string
      payments?: Array<{ mode_of_payment: string; amount: number }>
      items: Array<{ item_code: string; qty: number; rate: number; discount_percentage?: number }>
    },
    { name?: string }
  >('Sales Invoice', {
    customer: form.customer,
    due_date: dueDate,
    is_pos: modeOfPayment ? 1 : 0,
    ...(modeOfPayment ? { mode_of_payment: modeOfPayment } : {}),
    ...(modeOfPayment ? { payments: [{ mode_of_payment: modeOfPayment, amount: calculatedGrandTotal }] } : {}),
    items: form.items.map((line) => ({
      item_code: line.itemCode,
      qty: line.qty,
      rate: line.rate,
      discount_percentage: line.discountPercent > 0 ? line.discountPercent : undefined,
    })),
  })

  const name = String(created.name ?? '')
  if (name) {
    await registerTransactionForApproval('sales_invoice', name, calculatedGrandTotal)
  }
  return name
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