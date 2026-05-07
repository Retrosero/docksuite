import { createResource, getResourceList } from '../../../services/erpApi'
import type {
  CustomerForm,
  CustomerInvoiceSummary,
  CustomerItem,
  CustomerLedgerMovement,
  CustomerLookupOption,
  CustomerNote,
  CustomerPurchasedProduct,
  CustomerSummary,
} from '../types'

type CustomerRow = {
  name: string
  customer_name?: string
  customer_group?: string
  territory?: string
  disabled?: number
}

type GlEntryRow = {
  party?: string
  debit?: number
  credit?: number
}

type CustomerGroupRow = {
  name: string
  customer_group_name?: string
}

type TerritoryRow = {
  name: string
  territory_name?: string
}

type SalesInvoiceRow = {
  name: string
  posting_date?: string
  grand_total?: number
  outstanding_amount?: number
  docstatus: number
}

type SalesInvoiceItemRow = {
  item_code?: string
  item_name?: string
  qty?: number
  amount?: number
}

type LedgerRow = {
  posting_date?: string
  voucher_type?: string
  voucher_no?: string
  debit?: number
  credit?: number
}

type CommentRow = {
  name: string
  content?: string
  creation?: string
  owner?: string
}

export async function fetchCustomers(): Promise<CustomerItem[]> {
  const customers = await getResourceList<CustomerRow>('Customer', {
    fields: ['name', 'customer_name', 'customer_group', 'territory', 'disabled'],
    orderBy: 'modified desc',
    limit: 200,
  })
  const glEntries = await getResourceList<GlEntryRow>('GL Entry', {
    fields: ['party', 'debit', 'credit'],
    filters: [
      ['party_type', '=', 'Customer'],
      ['party', 'is', 'set'],
    ],
    orderBy: 'posting_date desc',
    limit: 2000,
  }).catch(() => [])

  const balanceMap = new Map<string, number>()
  for (const entry of glEntries) {
    if (!entry.party) continue
    balanceMap.set(entry.party, (balanceMap.get(entry.party) ?? 0) + (entry.debit ?? 0) - (entry.credit ?? 0))
  }

  return customers.map((customer) => ({
    ...customer,
    balance: balanceMap.get(customer.name) ?? 0,
  }))
}

export function buildCustomerSummary(customers: CustomerItem[]): CustomerSummary {
  return {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((customer) => !customer.disabled).length,
    openBalance: customers.reduce((sum, customer) => sum + Math.max(customer.balance, 0), 0),
  }
}

export async function fetchCustomerGroups(): Promise<CustomerLookupOption[]> {
  const groups = await getResourceList<CustomerGroupRow>('Customer Group', {
    fields: ['name', 'customer_group_name'],
    orderBy: 'name asc',
    limit: 100,
  })

  return groups.map((group) => ({ name: group.name, label: group.customer_group_name || group.name }))
}

export async function fetchTerritories(): Promise<CustomerLookupOption[]> {
  const territories = await getResourceList<TerritoryRow>('Territory', {
    fields: ['name', 'territory_name'],
    orderBy: 'name asc',
    limit: 100,
  })

  return territories.map((territory) => ({ name: territory.name, label: territory.territory_name || territory.name }))
}

export async function createCustomerCard(form: CustomerForm): Promise<string> {
  const created = await createResource<
    {
      customer_name: string
      customer_type: string
      customer_group: string
      territory: string
    },
    { name?: string }
  >('Customer', {
    customer_name: form.customerName,
    customer_type: form.customerType,
    customer_group: form.customerGroup,
    territory: form.territory,
  })

  return String(created.name ?? '')
}

export async function fetchCustomerSalesInvoices(customerName: string): Promise<CustomerInvoiceSummary[]> {
  const rows = await getResourceList<SalesInvoiceRow>('Sales Invoice', {
    fields: ['name', 'posting_date', 'grand_total', 'outstanding_amount', 'docstatus'],
    filters: [['customer', '=', customerName]],
    orderBy: 'posting_date desc',
    limit: 100,
  }).catch(() => [])

  return rows.map((row) => ({
    invoiceName: row.name,
    postingDate: row.posting_date,
    grandTotal: row.grand_total ?? 0,
    outstandingAmount: row.outstanding_amount ?? 0,
    status: row.docstatus === 1 ? 'Kesildi' : 'Taslak',
  }))
}

export async function fetchCustomerPurchasedProducts(invoiceNames: string[]): Promise<CustomerPurchasedProduct[]> {
  if (invoiceNames.length === 0) return []
  const rows = await getResourceList<SalesInvoiceItemRow>('Sales Invoice Item', {
    fields: ['item_code', 'item_name', 'qty', 'amount'],
    filters: [['parent', 'in', invoiceNames]],
    limit: 1000,
  }).catch(() => [])

  const map = new Map<string, CustomerPurchasedProduct>()
  for (const row of rows) {
    const itemCode = row.item_code || 'Bilinmiyor'
    const current = map.get(itemCode) || {
      itemCode,
      itemName: row.item_name || itemCode,
      totalQty: 0,
      totalAmount: 0,
    }
    current.totalQty += row.qty ?? 0
    current.totalAmount += row.amount ?? 0
    map.set(itemCode, current)
  }
  return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount)
}

export async function fetchCustomerLedger(customerName: string): Promise<{ balance: number; movements: CustomerLedgerMovement[] }> {
  const rows = await getResourceList<LedgerRow>('GL Entry', {
    fields: ['posting_date', 'voucher_type', 'voucher_no', 'debit', 'credit'],
    filters: [['party_type', '=', 'Customer'], ['party', '=', customerName]],
    orderBy: 'posting_date asc',
    limit: 2000,
  }).catch(() => [])

  let runningBalance = 0
  const movements = rows.map((row) => {
    const debit = row.debit ?? 0
    const credit = row.credit ?? 0
    runningBalance += debit - credit
    return {
      postingDate: row.posting_date,
      voucherType: row.voucher_type,
      voucherNo: row.voucher_no,
      debit,
      credit,
      runningBalance,
    }
  })
  return { balance: runningBalance, movements: movements.reverse().slice(0, 20) }
}

export async function fetchCustomerNotes(customerName: string): Promise<CustomerNote[]> {
  const rows = await getResourceList<CommentRow>('Comment', {
    fields: ['name', 'content', 'creation', 'owner'],
    filters: [['reference_doctype', '=', 'Customer'], ['reference_name', '=', customerName]],
    orderBy: 'creation desc',
    limit: 50,
  }).catch(() => [])

  return rows.map((row) => ({
    name: row.name,
    content: row.content || '',
    createdAt: row.creation,
    owner: row.owner,
  }))
}
