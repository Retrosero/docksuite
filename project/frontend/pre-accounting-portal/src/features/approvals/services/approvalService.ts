import { erpGet, erpPost } from '../../../services/erpApi'

export type ApprovalRequest = {
  name: string
  document_type: string
  document_name: string
  amount: number
  approval_level: number
  requested_by: string
  status: 'Pending' | 'Approved' | 'Rejected'
  creation: string
}

type PendingApprovalsResponse = {
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
  approve: '/method/shipyard_app.pre_accounting_approval.approve_request',
  reject: '/method/shipyard_app.pre_accounting_approval.reject_request',
}

export async function fetchPendingApprovals(): Promise<ApprovalRequest[]> {
  const response = await erpGet<PendingApprovalsResponse>(APPROVAL_ENDPOINTS.pending)
  return response.message ?? []
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
