export type CariType = 'Musteri' | 'Tedarikci'

export type CariListItem = {
  id: string
  name: string
  type: CariType
  balance: number
  status: 'Aktif' | 'Pasif'
}
