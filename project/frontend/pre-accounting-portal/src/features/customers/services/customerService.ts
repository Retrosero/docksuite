import { getResourceList } from '../../../services/erpApi'
import type { CustomerItem, CustomerSummary } from '../types'

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

export async function fetchCustomers(): Promise<CustomerItem[]> {
  const [customers, glEntries] = await Promise.all([
    getResourceList<CustomerRow>('Customer', {
      fields: ['name', 'customer_name', 'customer_group', 'territory', 'disabled'],
      orderBy: 'modified desc',
      limit: 200,
    }),
    getResourceList<GlEntryRow>('GL Entry', {
      fields: ['party', 'debit', 'credit'],
      filters: [
        ['party_type', '=', 'Customer'],
        ['party', 'is', 'set'],
      ],
      orderBy: 'posting_date desc',
      limit: 2000,
    }),
  ])

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
