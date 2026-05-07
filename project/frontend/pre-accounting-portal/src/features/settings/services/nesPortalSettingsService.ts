import { erpGet, erpPost } from '../../../services/erpApi'

export type NesPortalConfig = {
  enabled: number
  base_url: string
  send_path: string
  status_path: string
  username: string
  access_token: string
  webhook_secret: string
  sandbox: number
}

export type NesPortalQueueItem = {
  name: string
  customer: string
  customer_name?: string
  posting_date: string
  grand_total: number
  currency?: string
  nes_portal_status?: string
  nes_portal_uuid?: string
  nes_portal_last_sync_at?: string
  nes_portal_error?: string
  can_send: boolean
  can_sync: boolean
}

export type NesPortalQueueResponse = {
  items: NesPortalQueueItem[]
  count: number
}

export type NesPortalMutationResponse = {
  status: 'ok' | 'error'
  message?: string
  invoice?: NesPortalQueueItem
}

const NES_ENDPOINTS = {
  config: '/method/shipyard_app.pre_accounting_nes_portal.get_nes_portal_config',
  save: '/method/shipyard_app.pre_accounting_nes_portal.save_nes_portal_config',
  queue: '/method/shipyard_app.pre_accounting_nes_portal.get_e_document_queue',
  send: '/method/shipyard_app.pre_accounting_nes_portal.send_sales_invoice_to_nes',
  sync: '/method/shipyard_app.pre_accounting_nes_portal.sync_nes_document_status',
}

export async function fetchNesPortalConfig(): Promise<NesPortalConfig> {
  const response = await erpGet<{ message?: NesPortalConfig }>(NES_ENDPOINTS.config)
  if (!response.message) throw new Error('NES Portal ayarlari alinamadi.')
  return response.message
}

export async function saveNesPortalConfig(payload: NesPortalConfig): Promise<NesPortalConfig> {
  const response = await erpPost<{ message?: NesPortalConfig }, NesPortalConfig>(NES_ENDPOINTS.save, payload)
  if (!response.message) throw new Error('NES Portal ayarlari kaydedilemedi.')
  return response.message
}

export async function fetchNesPortalQueue(limit = 25): Promise<NesPortalQueueResponse> {
  const response = await erpPost<{ message?: NesPortalQueueResponse }, { limit: number }>(NES_ENDPOINTS.queue, { limit })
  if (!response.message) throw new Error('NES Portal kuyrugu alinamadi.')
  return response.message
}

export async function sendInvoiceToNes(invoiceName: string): Promise<NesPortalMutationResponse> {
  const response = await erpPost<{ message?: NesPortalMutationResponse }, { invoice_name: string }>(NES_ENDPOINTS.send, {
    invoice_name: invoiceName,
  })
  if (!response.message) throw new Error('Fatura NES Portal tarafina gonderilemedi.')
  return response.message
}

export async function syncNesInvoiceStatus(invoiceName: string): Promise<NesPortalMutationResponse> {
  const response = await erpPost<{ message?: NesPortalMutationResponse }, { invoice_name: string }>(NES_ENDPOINTS.sync, {
    invoice_name: invoiceName,
  })
  if (!response.message) throw new Error('NES Portal durumu sorgulanamadi.')
  return response.message
}
