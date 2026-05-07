import { createResource, getResourceList } from '../../../services/erpApi'
import type { CustomerForm, CustomerItem, CustomerLookupOption, CustomerSummary } from '../types'

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
