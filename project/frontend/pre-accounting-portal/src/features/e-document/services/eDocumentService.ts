import { erpPost } from '../../../services/erpApi'

// =============================================================================
// Faz J: NES Portal E-Belge Merkezi Servisleri
// =============================================================================

export type NesDocumentStatus = 'Not Sent' | 'Queued' | 'Sent' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Error'
export type DirectionStatus = 'Gonderildi' | 'Teslim Alindi' | 'Okundu' | 'Reddedildi'
export type DocumentType = 'e-Fatura' | 'e-Arsiv' | 'e-Irsaliye'
export type Direction = 'Outgoing' | 'Incoming'

export interface EDocument {
  id: string
  document_type: DocumentType
  direction: Direction
  erp_document_type: string
  erp_document_name: string
  customer?: string
  customer_name?: string
  posting_date: string
  due_date?: string
  grand_total: number
  currency: string
  nes_status: NesDocumentStatus
  nes_uuid?: string
  direction_status?: DirectionStatus
  last_sync_at?: string
  received_at?: string
  error_message?: string
  retry_count?: number
  last_retry_at?: string
  can_send?: boolean
  can_sync?: boolean
  can_reject?: boolean
  can_cancel?: boolean
  can_accept?: boolean
  can_convert?: boolean
  linked_purchase_invoice?: string
}

export interface DocumentHistoryLog {
  name: string
  document_type: DocumentType
  direction: Direction
  nes_status: NesDocumentStatus
  direction_status?: DirectionStatus
  callback_received_at?: string
  last_sync_at?: string
  error_message?: string
  raw_response?: string
}

export interface DocumentListResponse {
  items: EDocument[]
  count: number
}

export interface DocumentHistoryResponse {
  logs: DocumentHistoryLog[]
}

export interface OperationResult {
  status: 'ok' | 'error'
  message?: string
  document?: string
  purchase_invoice?: string
}

type OperationResponse = OperationResult | { message?: OperationResult }

function normalizeOperationResponse(response: OperationResponse): OperationResult {
  if ('status' in response) {
    return response
  }
  return response.message ?? { status: 'error', message: 'Islem basarisiz' }
}

const E_DOCUMENT_ENDPOINTS = {
  sent_documents: '/method/shipyard_app.pre_accounting_nes_portal.get_sent_documents',
  received_documents: '/method/shipyard_app.pre_accounting_nes_portal.get_received_documents',
  document_history: '/method/shipyard_app.pre_accounting_nes_portal.get_document_history',
  reject_document: '/method/shipyard_app.pre_accounting_nes_portal.reject_nes_document',
  cancel_document: '/method/shipyard_app.pre_accounting_nes_portal.cancel_nes_document',
  return_document: '/method/shipyard_app.pre_accounting_nes_portal.return_nes_document',
  resend_document: '/method/shipyard_app.pre_accounting_nes_portal.resend_nes_document',
  sync_document: '/method/shipyard_app.pre_accounting_nes_portal.sync_nes_document_status',
  send_document: '/method/shipyard_app.pre_accounting_nes_portal.send_sales_invoice_to_nes',
  convert_incoming: '/method/shipyard_app.pre_accounting_nes_portal.convert_received_document_to_purchase_invoice',
  retry_failed: '/method/shipyard_app.pre_accounting_nes_portal.retry_failed_nes_documents',
}

export async function getSentDocuments(
  limit = 50,
  documentType?: DocumentType,
  status?: NesDocumentStatus
): Promise<DocumentListResponse> {
  const response = await erpPost<{ message?: DocumentListResponse }, { limit: number; document_type?: string; status?: string }>(
    E_DOCUMENT_ENDPOINTS.sent_documents,
    { limit, document_type: documentType, status }
  )
  if (!response.message) throw new Error('Giden belgeler alınamadı')
  return response.message
}

export async function getReceivedDocuments(
  limit = 50,
  documentType?: DocumentType,
  status?: NesDocumentStatus
): Promise<DocumentListResponse> {
  const response = await erpPost<{ message?: DocumentListResponse }, { limit: number; document_type?: string; status?: string }>(
    E_DOCUMENT_ENDPOINTS.received_documents,
    { limit, document_type: documentType, status }
  )
  if (!response.message) throw new Error('Gelen belgeler alınamadı')
  return response.message
}

export async function getDocumentHistory(
  documentName: string,
  documentType = 'Sales Invoice'
): Promise<DocumentHistoryResponse> {
  const response = await erpPost<{ message?: DocumentHistoryResponse }, { document_name: string; document_type: string }>(
    E_DOCUMENT_ENDPOINTS.document_history,
    { document_name: documentName, document_type: documentType }
  )
  if (!response.message) throw new Error('Belge geçmişi alınamadı')
  return response.message
}

export async function rejectDocument(
  documentName: string,
  reason: string,
  documentType = 'Sales Invoice'
): Promise<OperationResult> {
  const response = await erpPost<OperationResponse, { document_name: string; reason: string; document_type: string }>(
    E_DOCUMENT_ENDPOINTS.reject_document,
    { document_name: documentName, reason, document_type: documentType }
  )
  return normalizeOperationResponse(response)
}

export async function cancelDocument(
  documentName: string,
  reason: string,
  documentType = 'Sales Invoice'
): Promise<OperationResult> {
  const response = await erpPost<OperationResponse, { document_name: string; reason: string; document_type: string }>(
    E_DOCUMENT_ENDPOINTS.cancel_document,
    { document_name: documentName, reason, document_type: documentType }
  )
  return normalizeOperationResponse(response)
}

export async function returnDocument(
  documentName: string,
  reason: string,
  documentType = 'Sales Invoice'
): Promise<OperationResult> {
  const response = await erpPost<OperationResponse, { document_name: string; reason: string; document_type: string }>(
    E_DOCUMENT_ENDPOINTS.return_document,
    { document_name: documentName, reason, document_type: documentType }
  )
  return normalizeOperationResponse(response)
}

export async function resendDocument(
  documentName: string,
  documentType = 'Sales Invoice'
): Promise<OperationResult> {
  const response = await erpPost<OperationResponse, { document_name: string; document_type: string }>(
    E_DOCUMENT_ENDPOINTS.resend_document,
    { document_name: documentName, document_type: documentType }
  )
  return normalizeOperationResponse(response)
}

export async function syncDocumentStatus(
  documentName: string
): Promise<{ status: 'ok' | 'error'; invoice?: EDocument; message?: string }> {
  const response = await erpPost<{ message?: { status: 'ok' | 'error'; invoice?: EDocument; message?: string } }, { invoice_name: string }>(
    E_DOCUMENT_ENDPOINTS.sync_document,
    { invoice_name: documentName }
  )
  if (response.message?.status) {
    return response.message
  }
  return { status: 'error', message: 'Senkronizasyon basarisiz' }
}

export function formatStatus(status: NesDocumentStatus): string {
  const labels: Record<NesDocumentStatus, string> = {
    'Not Sent': 'Gonderilmedi',
    'Queued': 'Sirada',
    'Sent': 'Gonderildi',
    'Accepted': 'Kabul Edildi',
    'Rejected': 'Reddedildi',
    'Cancelled': 'Iptal Edildi',
    'Error': 'Hata',
  }
  return labels[status] || status
}

export function getStatusColor(status: NesDocumentStatus): string {
  const colors: Record<NesDocumentStatus, string> = {
    'Not Sent': 'var(--color-muted)',
    'Queued': 'var(--color-warning)',
    'Sent': 'var(--color-info)',
    'Accepted': 'var(--color-success)',
    'Rejected': 'var(--color-error)',
    'Cancelled': 'var(--color-muted)',
    'Error': 'var(--color-error)',
  }
  return colors[status] || 'var(--color-muted)'
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency || 'TRY',
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export async function convertIncomingToPurchaseInvoice(logName: string): Promise<OperationResult> {
  const response = await erpPost<OperationResponse, { log_name: string }>(
    E_DOCUMENT_ENDPOINTS.convert_incoming,
    { log_name: logName },
  )
  return normalizeOperationResponse(response)
}

export async function retryFailedDocuments(limit = 20): Promise<OperationResult> {
  const response = await erpPost<OperationResponse, { limit: number }>(
    E_DOCUMENT_ENDPOINTS.retry_failed,
    { limit },
  )
  return normalizeOperationResponse(response)
}
