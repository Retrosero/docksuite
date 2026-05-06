import { createResource, getResourceList } from '../../../services/erpApi'

export type RequiredMasterDataKey =
  | 'customer_group'
  | 'territory'
  | 'supplier_group'
  | 'item_group'
  | 'uom'
  | 'mode_of_payment'

export type RequiredMasterDataDefinition = {
  key: RequiredMasterDataKey
  label: string
  doctype: string
  nameField: string
  parentField?: string
  usedBy: string[]
}

export type RequiredMasterDataStatus = {
  key: RequiredMasterDataKey
  label: string
  doctype: string
  count: number
  isReady: boolean
  samples: string[]
  usedBy: string[]
}

type GenericRow = {
  name?: string
  is_group?: number
  [key: string]: unknown
}

export type ParentOption = {
  name: string
  label: string
}

export const REQUIRED_MASTER_DATA_DEFINITIONS: RequiredMasterDataDefinition[] = [
  {
    key: 'customer_group',
    label: 'Müşteri Grubu',
    doctype: 'Customer Group',
    nameField: 'customer_group_name',
    parentField: 'parent_customer_group',
    usedBy: ['Müşteri kartı oluşturma', 'Satış akışları'],
  },
  {
    key: 'territory',
    label: 'Bölge',
    doctype: 'Territory',
    nameField: 'territory_name',
    parentField: 'parent_territory',
    usedBy: ['Müşteri kartı oluşturma'],
  },
  {
    key: 'supplier_group',
    label: 'Tedarikçi Grubu',
    doctype: 'Supplier Group',
    nameField: 'supplier_group_name',
    parentField: 'parent_supplier_group',
    usedBy: ['Tedarikçi kartı oluşturma', 'Alış akışları'],
  },
  {
    key: 'item_group',
    label: 'Ürün Grubu',
    doctype: 'Item Group',
    nameField: 'item_group_name',
    parentField: 'parent_item_group',
    usedBy: ['Ürün kartı oluşturma', 'Satış ve stok akışları'],
  },
  {
    key: 'uom',
    label: 'Stok Birimi',
    doctype: 'UOM',
    nameField: 'uom_name',
    usedBy: ['Ürün kartı oluşturma'],
  },
  {
    key: 'mode_of_payment',
    label: 'Ödeme Yöntemi',
    doctype: 'Mode of Payment',
    nameField: 'mode_of_payment',
    usedBy: ['Tahsilat', 'Gider ve ödeme akışları'],
  },
]

function getDefinition(key: RequiredMasterDataKey): RequiredMasterDataDefinition {
  const definition = REQUIRED_MASTER_DATA_DEFINITIONS.find((item) => item.key === key)
  if (!definition) {
    throw new Error('Zorunlu veri tanımı bulunamadı.')
  }
  return definition
}

export async function fetchRequiredMasterDataStatuses(): Promise<RequiredMasterDataStatus[]> {
  const statuses = await Promise.all(
    REQUIRED_MASTER_DATA_DEFINITIONS.map(async (definition) => {
      const fields = ['name', definition.nameField]
      const rows = await getResourceList<GenericRow>(definition.doctype, { fields, limit: 500 })
      const samples = rows
        .map((row) => String(row[definition.nameField] || row.name || '').trim())
        .filter(Boolean)
        .slice(0, 3)

      return {
        key: definition.key,
        label: definition.label,
        doctype: definition.doctype,
        count: rows.length,
        isReady: rows.length > 0,
        samples,
        usedBy: definition.usedBy,
      } satisfies RequiredMasterDataStatus
    }),
  )

  return statuses
}

export async function fetchParentOptions(key: RequiredMasterDataKey): Promise<ParentOption[]> {
  const definition = getDefinition(key)
  if (!definition.parentField) return []

  const rows = await getResourceList<GenericRow>(definition.doctype, {
    fields: ['name', definition.nameField, 'is_group'],
    limit: 500,
  })

  const groupRows = rows.filter((row) => Number(row.is_group ?? 0) === 1)
  const sourceRows = groupRows.length > 0 ? groupRows : rows

  return sourceRows
    .map((row) => ({
      name: String(row.name || ''),
      label: String(row[definition.nameField] || row.name || ''),
    }))
    .filter((row) => row.name && row.label)
}

export async function createRequiredMasterDataEntry(args: {
  key: RequiredMasterDataKey
  label: string
  parentName?: string
}): Promise<string> {
  const definition = getDefinition(args.key)
  const payload: Record<string, unknown> = {
    [definition.nameField]: args.label.trim(),
  }

  if (definition.parentField && args.parentName) {
    payload[definition.parentField] = args.parentName
  }

  if (definition.parentField) {
    payload.is_group = 0
  }

  const created = await createResource<Record<string, unknown>, { name?: string }>(definition.doctype, payload)
  return created.name || args.label.trim()
}
