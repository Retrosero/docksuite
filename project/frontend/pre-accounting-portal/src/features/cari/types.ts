export type CariType = 'Müşteri' | 'Tedarikçi'

export type CariListItem = {
  id: string
  name: string
  type: CariType
  balance: number
  status: 'Aktif' | 'Pasif'
}

export type SupplierType = 'Company' | 'Individual'

export type SupplierLookupOption = {
  name: string
  label: string
}

export type SupplierForm = {
  supplierName: string
  supplierType: SupplierType
  supplierGroup: string
}
