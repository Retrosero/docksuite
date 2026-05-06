import { createResource, getResourceList } from '../../../services/erpApi'
import { registerTransactionForApproval } from '../../approvals/services/approvalTriggerService'
import type { OpenSalesInvoiceItem, PaymentEntryForm, PaymentEntryItem } from '../types'

type CustomerRow = {
  name: string
  customer_name?: string
}

type ModeRow = {
  name: string
}

type PaymentEntryReferenceRow = {
  parent: string
  reference_name?: string
  outstanding_amount?: number
  allocated_amount?: number
}

export async function fetchPaymentEntries(): Promise<PaymentEntryItem[]> {
  const paymentEntries = await getResourceList<PaymentEntryItem>('Payment Entry', {
    fields: ['name', 'party', 'paid_amount', 'mode_of_payment', 'docstatus'],
    filters: [['payment_type', '=', 'Receive']],
    orderBy: 'modified desc',
    limit: 50,
  })

  if (!paymentEntries.length) return paymentEntries

  const names = paymentEntries.map((entry) => entry.name)
  const references = await getResourceList<PaymentEntryReferenceRow>('Payment Entry Reference', {
    fields: ['parent', 'reference_name', 'outstanding_amount', 'allocated_amount'],
    filters: [
      ['parenttype', '=', 'Payment Entry'],
      ['reference_doctype', '=', 'Sales Invoice'],
      ['parent', 'in', names],
    ],
    limit: 500,
  })

  const referenceMap = new Map<string, PaymentEntryReferenceRow>()
  for (const row of references) {
    if (!referenceMap.has(row.parent)) {
      referenceMap.set(row.parent, row)
    }
  }

  return paymentEntries.map((entry) => {
    const ref = referenceMap.get(entry.name)
    if (!ref) {
      return { ...entry, reference_invoice: '-', closure_status: '-' as const }
    }
    const remaining = Math.max((ref.outstanding_amount ?? 0) - (ref.allocated_amount ?? 0), 0)
    return {
      ...entry,
      reference_invoice: ref.reference_name || '-',
      closure_status: remaining === 0 ? ('Tam Kapandı' as const) : ('Kısmi Tahsilat' as const),
    }
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
  const name = String(created.name ?? '')
  if (name) {
    await registerTransactionForApproval('payment_entry', name, form.paidAmount)
  }
  return name
}
