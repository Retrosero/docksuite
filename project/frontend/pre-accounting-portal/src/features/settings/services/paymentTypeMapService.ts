import { erpGet, erpPost } from '../../../services/erpApi'

const GET_ENDPOINT = '/method/shipyard_app.pre_accounting_api.get_payment_type_map'
const SAVE_ENDPOINT = '/method/shipyard_app.pre_accounting_api.save_payment_type_map'

export type PaymentTypeMap = {
  Nakit: string
  Havale: string
  'Kredi Kartı': string
}

const EMPTY: PaymentTypeMap = {
  Nakit: '',
  Havale: '',
  'Kredi Kartı': '',
}

export async function getPaymentTypeMap(): Promise<PaymentTypeMap> {
  const response = await erpGet<{ message?: { mapping?: Partial<PaymentTypeMap> } }>(GET_ENDPOINT)
  return { ...EMPTY, ...(response.message?.mapping || {}) }
}

export async function savePaymentTypeMap(mapping: PaymentTypeMap): Promise<PaymentTypeMap> {
  const response = await erpPost<{ message?: { mapping?: Partial<PaymentTypeMap> } }, { mapping: PaymentTypeMap }>(SAVE_ENDPOINT, { mapping })
  return { ...EMPTY, ...(response.message?.mapping || {}) }
}
