import { erpPost } from '../../../services/erpApi'

export type PeriodClosingCheck = {
  check_name: string
  status: 'passed' | 'failed' | 'warning'
  details: string
  items: Array<{ name: string; [key: string]: unknown }>
}

export type PeriodClosingReport = {
  period_start: string
  period_end: string
  total_checks: number
  passed_checks: number
  failed_checks: number
  is_ready_for_closing: boolean
  checks: PeriodClosingCheck[]
}

export type CustomerRiskProfile = {
  customer: string
  customer_name: string
  credit_limit: number
  total_outstanding: number
  available_credit: number | null
  is_over_limit: boolean
  risk_level: 'Kritik' | 'Yüksek' | 'Orta' | 'Düşük' | 'Bilinmiyor'
}

const E_INVOICE_ENDPOINTS = {
  closing_checks: '/method/shipyard_app.pre_accounting_einvoice.run_period_closing_checks',
  customer_risk: '/method/shipyard_app.pre_accounting_einvoice.get_customer_risk_profile',
  reconciliation: '/method/shipyard_app.pre_accounting_einvoice.get_reconciliation_report',
}

export async function runPeriodClosingChecks(fromDate: string, toDate: string): Promise<PeriodClosingReport> {
  const response = await erpPost<{ message?: PeriodClosingReport }, { period_start: string; period_end: string }>(
    E_INVOICE_ENDPOINTS.closing_checks,
    { period_start: fromDate, period_end: toDate }
  )
  if (!response.message) throw new Error('Dönem kapanış kontrolleri alınamadı')
  return response.message
}

export async function getCustomerRiskProfile(customer: string): Promise<CustomerRiskProfile> {
  const response = await erpPost<{ message?: CustomerRiskProfile }, { customer: string }>(
    E_INVOICE_ENDPOINTS.customer_risk,
    { customer }
  )
  if (!response.message) throw new Error('Müşteri risk profili alınamadı')
  return response.message
}

export async function getReconciliationReport(partyType: 'Customer' | 'Supplier', party: string): Promise<{
  party_type: string
  party: string
  invoices: Array<{ name: string; posting_date: string; due_date: string; outstanding_amount: number }>
  payments: Array<{ name: string; parent: string; allocated_amount: number }>
  total_outstanding: number
}> {
  const response = await erpPost<{ message?: unknown }, { party_type: string; party: string }>(
    E_INVOICE_ENDPOINTS.reconciliation,
    { party_type: partyType, party }
  )
  if (!response.message) throw new Error('Mutabakat raporu alınamadı')
  return response.message as ReturnType<typeof getReconciliationReport> extends Promise<infer T> ? T : never
}

export function formatCheckStatus(status: PeriodClosingCheck['status']): string {
  const labels: Record<PeriodClosingCheck['status'], string> = {
    passed: '✓ Geçti',
    failed: '✗ Başarısız',
    warning: '⚠ Uyarı',
  }
  return labels[status]
}

export function formatRiskLevel(level: CustomerRiskProfile['risk_level']): string {
  const colors: Record<CustomerRiskProfile['risk_level'], string> = {
    'Kritik': 'var(--color-error)',
    'Yüksek': 'var(--color-warning)',
    'Orta': 'var(--color-info)',
    'Düşük': 'var(--color-success)',
    'Bilinmiyor': 'var(--color-muted)',
  }
  return colors[level]
}
