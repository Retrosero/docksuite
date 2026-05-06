import { erpGet, erpPost } from '../../../services/erpApi'

export type ApprovalRequest = {
  name: string
  document_type: string
  document_name: string
  amount: number
  approval_level: number
  requested_by: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  source_reason?: string
  limit_action_key?: string | null
  limit_value?: number | null
  status: 'Pending' | 'Approved' | 'Rejected'
  creation: string
}

type PendingApprovalsResponse = {
  message?: ApprovalRequest[]
}
type ApprovalTimelineResponse = {
  message?: ApprovalRequest[]
}

type ApprovalActionResponse = {
  message?: {
    status: string
    name: string
  }
}

const APPROVAL_ENDPOINTS = {
  pending: '/method/shipyard_app.pre_accounting_approval.get_pending_approvals',
  timeline: '/method/shipyard_app.pre_accounting_approval.get_approval_timeline',
  states: '/method/shipyard_app.pre_accounting_approval.get_approval_states',
  approve: '/method/shipyard_app.pre_accounting_approval.approve_request',
  reject: '/method/shipyard_app.pre_accounting_approval.reject_request',
}

export async function fetchPendingApprovals(): Promise<ApprovalRequest[]> {
  const response = await erpGet<PendingApprovalsResponse>(APPROVAL_ENDPOINTS.pending)
  return response.message ?? []
}

export async function fetchApprovalTimeline(limit = 100): Promise<ApprovalRequest[]> {
  const response = await erpGet<ApprovalTimelineResponse>(`${APPROVAL_ENDPOINTS.timeline}?limit=${limit}`)
  return response.message ?? []
}

type ApprovalStatesResponse = {
  message?: {
    states?: Record<string, string>
  }
}

export async function fetchApprovalStates(documentType: string, documentNames: string[]): Promise<Record<string, string>> {
  if (!documentNames.length) return {}
  const response = await erpPost<ApprovalStatesResponse, { document_type: string; document_names: string[] }>(APPROVAL_ENDPOINTS.states, {
    document_type: documentType,
    document_names: documentNames,
  })
  return response.message?.states ?? {}
}

export function formatApprovalStatusLabel(status?: string | null): string {
  if (status === 'Pending') return 'Onay Bekliyor'
  if (status === 'Approved') return 'Onaylandi'
  if (status === 'Rejected') return 'Reddedildi'
  return '-'
}

export async function approveRequest(requestName: string, comment?: string): Promise<boolean> {
  const response = await erpPost<ApprovalActionResponse, Record<string, string>>(
    APPROVAL_ENDPOINTS.approve,
    { request_name: requestName, approver_comment: comment ?? '' }
  )
  return response.message?.status === 'Approved'
}

export async function rejectRequest(requestName: string, reason: string): Promise<boolean> {
  const response = await erpPost<ApprovalActionResponse, Record<string, string>>(
    APPROVAL_ENDPOINTS.reject,
    { request_name: requestName, rejection_reason: reason }
  )
  return response.message?.status === 'Rejected'
}

export function formatDocumentTypeLabel(docType: string): string {
  const labels: Record<string, string> = {
    'sales_invoice': 'Satış Faturası',
    'payment_entry': 'Tahsilat/Ödeme',
    'purchase_invoice': 'Alış Faturası',
    'expense': 'Gider',
  }
  return labels[docType] ?? docType
}

export function formatApprovalLevel(level: number): string {
  const labels: Record<number, string> = {
    1: 'Düşük Öncelik',
    2: 'Normal Öncelik',
    3: 'Yüksek Öncelik',
  }
  return labels[level] ?? `Seviye ${level}`
}
