import { createResource, getResourceList } from '../../../services/erpApi'
import type { OpenSalesInvoiceItem, PaymentEntryForm, PaymentEntryItem } from '../types'

type CustomerRow = {
  name: string
  customer_name?: string
}

type ModeRow = {
  name: string
}

export async function fetchPaymentEntries(): Promise<PaymentEntryItem[]> {
  return getResourceList<PaymentEntryItem>('Payment Entry', {
    fields: ['name', 'party', 'paid_amount', 'mode_of_payment', 'docstatus'],
    filters: [['payment_type', '=', 'Receive']],
    orderBy: 'modified desc',
    limit: 50,
  })
}

export async function fetchCollectionCustomers(): Promise<CustomerRow[]> {
  return getResourceList<CustomerRow>('Customer', {
    fields: ['name', 'customer_name'],
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

export async function fetchOpenSalesInvoices(customer: string): Promise<OpenSalesInvoiceItem[]> {
  if (!customer) return []
  return getResourceList<OpenSalesInvoiceItem>('Sales Invoice', {
    fields: ['name', 'posting_date', 'outstanding_amount', 'grand_total'],
    filters: [
      ['customer', '=', customer],
      ['docstatus', '=', 1],
      ['outstanding_amount', '>', 0],
    ],
    orderBy: 'posting_date asc',
    limit: 100,
  })
}

export async function createCollectionEntry(form: PaymentEntryForm): Promise<string> {
  const references = form.referenceInvoice
    ? [
        {
          reference_doctype: 'Sales Invoice',
          reference_name: form.referenceInvoice,
          allocated_amount: form.paidAmount,
        },
      ]
    : []

  const created = await createResource<
    {
      payment_type: string
      party_type: string
      party: string
      paid_amount: number
      received_amount: number
      mode_of_payment: string
      posting_date: string
      references: Array<{
        reference_doctype: string
        reference_name: string
        allocated_amount: number
      }>
    },
    { name?: string }
  >('Payment Entry', {
    payment_type: 'Receive',
    party_type: 'Customer',
    party: form.party,
    paid_amount: form.paidAmount,
    received_amount: form.paidAmount,
    mode_of_payment: form.modeOfPayment,
    posting_date: new Date().toISOString().slice(0, 10),
    references,
  })
  return String(created.name ?? '')
}
