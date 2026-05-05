import { createResource, getResourceList } from '../../../services/erpApi'
import type { CariListItem, SupplierForm, SupplierLookupOption } from '../types'

type CustomerRow = {
  name: string
  customer_name?: string
  disabled?: number
}

type SupplierRow = {
  name: string
  supplier_name?: string
  disabled?: number
}

type SupplierGroupRow = {
  name: string
  supplier_group_name?: string
}

type GlEntryRow = {
  party?: string
  party_type?: string
  debit?: number
  credit?: number
}

function toStatus(disabled?: number): 'Aktif' | 'Pasif' {
  return disabled ? 'Pasif' : 'Aktif'
}

export async function fetchCariList(): Promise<CariListItem[]> {
  const [customers, suppliers, glEntries] = await Promise.all([
    getResourceList<CustomerRow>('Customer', {
      fields: ['name', 'customer_name', 'disabled'],
      limit: 100,
      orderBy: 'modified desc',
    }),
    getResourceList<SupplierRow>('Supplier', {
      fields: ['name', 'supplier_name', 'disabled'],
      limit: 100,
      orderBy: 'modified desc',
    }),
    getResourceList<GlEntryRow>('GL Entry', {
      fields: ['party', 'party_type', 'debit', 'credit'],
      filters: [['party', 'is', 'set']],
      limit: 2000,
      orderBy: 'posting_date desc',
    }),
  ])

  const balanceMap = new Map<string, number>()
  for (const entry of glEntries) {
    if (!entry.party) continue
    const current = balanceMap.get(entry.party) ?? 0
    balanceMap.set(entry.party, current + (entry.debit ?? 0) - (entry.credit ?? 0))
  }

  const customerItems: CariListItem[] = customers.map((row) => ({
    id: row.name,
    name: row.customer_name || row.name,
    type: 'Müşteri',
    balance: balanceMap.get(row.name) ?? 0,
    status: toStatus(row.disabled),
  }))

  const supplierItems: CariListItem[] = suppliers.map((row) => ({
    id: row.name,
    name: row.supplier_name || row.name,
    type: 'Tedarikçi',
    balance: balanceMap.get(row.name) ?? 0,
    status: toStatus(row.disabled),
  }))

  return [...customerItems, ...supplierItems].sort((a, b) => b.balance - a.balance)
}

export async function fetchSupplierGroups(): Promise<SupplierLookupOption[]> {
  const groups = await getResourceList<SupplierGroupRow>('Supplier Group', {
    fields: ['name', 'supplier_group_name'],
    orderBy: 'name asc',
    limit: 100,
  })

  return groups.map((group) => ({ name: group.name, label: group.supplier_group_name || group.name }))
}

export async function createSupplierCard(form: SupplierForm): Promise<string> {
  const created = await createResource<
    {
      supplier_name: string
      supplier_type: string
      supplier_group: string
    },
    { name?: string }
  >('Supplier', {
    supplier_name: form.supplierName,
    supplier_type: form.supplierType,
    supplier_group: form.supplierGroup,
  })

  return String(created.name ?? '')
}
