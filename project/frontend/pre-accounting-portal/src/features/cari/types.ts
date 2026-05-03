export type CariType = 'Müşteri' | 'Tedarikçi'

export type CariListItem = {
  id: string
  name: string
  type: CariType
  balance: number
  status: 'Aktif' | 'Pasif'
}
