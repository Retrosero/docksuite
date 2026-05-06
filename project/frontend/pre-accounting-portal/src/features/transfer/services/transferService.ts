import { erpPost } from '../../../services/erpApi'

// =============================================================================
// Faz K: Mali Musavir ve Muhasebe Aktarim Merkezi Servisleri
// =============================================================================

export type TransferSoftware = 'Luca' | 'Zirve' | 'Orka' | 'Datasoft'
export type DocumentType = 'Sales Invoice' | 'Purchase Invoice' | 'Payment Entry' | 'Journal Entry'
export type PackageStatus = 'Draft' | 'Ready' | 'Exported' | 'Error'

export interface SoftwareInfo {
  id: TransferSoftware
  name: TransferSoftware
  format: string
  features: string[]
}

export interface TransferConfig {
  name: string
  software: TransferSoftware
  export_path: string
  date_format: string
  currency_code: string
}

export interface PackageItem {
  document_type: DocumentType
  record_count: number
}

export interface TransferPackage {
  name: string
  software: string | null
  period_start: string
  period_end: string
  document_types: PackageItem[]
  status: PackageStatus
  record_count: number
  error_count: number
  exported_at: string
}

export interface DocumentItem {
  name: string
  posting_date: string
  party_name?: string
  customer_name?: string
  supplier_name?: string
  grand_total: number
  outstanding_amount: number
  document_type: DocumentType
  package_item?: DocumentType
}

export interface TransferError {
  name: string
  document_type: string
  document_name: string
  message: string
  creation: string
}

export interface ExportResult {
  status: 'ok' | 'error'
  package: string
  format: string
  record_count: number
  data: {
    format: string
    rows: Record<string, unknown>[]
  }
}

const TRANSFER_ENDPOINTS = {
  software_list: '/method/shipyard_app.pre_accounting_transfer.get_transfer_software_list',
  configs: '/method/shipyard_app.pre_accounting_transfer.get_transfer_configs',
  create_config: '/method/shipyard_app.pre_accounting_transfer.create_transfer_config',
  packages: '/method/shipyard_app.pre_accounting_transfer.create_transfer_package',
  package_documents: '/method/shipyard_app.pre_accounting_transfer.get_package_documents',
  export: '/method/shipyard_app.pre_accounting_transfer.export_package',
  history: '/method/shipyard_app.pre_accounting_transfer.get_transfer_history',
  errors: '/method/shipyard_app.pre_accounting_transfer.get_transfer_errors',
  delete_package: '/method/shipyard_app.pre_accounting_transfer.delete_transfer_package',
}

export async function getTransferSoftwareList(): Promise<{ items: SoftwareInfo[] }> {
  const response = await erpPost<{ message?: { items: SoftwareInfo[] } }>(
    TRANSFER_ENDPOINTS.software_list,
    {}
  )
  if (!response.message?.items) throw new Error('Yazilim listesi alinamadi')
  return response.message
}

export async function getTransferConfigs(): Promise<{ items: TransferConfig[] }> {
  const response = await erpPost<{ message?: { items: TransferConfig[] } }>(
    TRANSFER_ENDPOINTS.configs,
    {}
  )
  if (!response.message?.items) throw new Error('Konfigurasyonlar alinamadi')
  return response.message
}

export async function createTransferConfig(config: {
  software: TransferSoftware
  export_path?: string
  date_format?: string
  currency_code?: string
}): Promise<{ status: string; config: string }> {
  const response = await erpPost<{ message?: { status: string; config: string } }>(
    TRANSFER_ENDPOINTS.create_config,
    config
  )
  if (!response.message) throw new Error('Konfigurasyon olusturulamadi')
  return response.message
}

export async function createTransferPackage(
  software: TransferSoftware | null,
  periodStart: string,
  periodEnd: string,
  documentTypes?: DocumentType[]
): Promise<{ status: string; package: string; record_count: number }> {
  const response = await erpPost<
    { message?: { status: string; package: string; record_count: number } },
    { software: string | null; period_start: string; period_end: string; document_types?: string[] }
  >(TRANSFER_ENDPOINTS.packages, {
    software,
    period_start: periodStart,
    period_end: periodEnd,
    document_types: documentTypes,
  })
  if (!response.message) throw new Error('Paket olusturulamadi')
  return response.message
}

export async function getPackageDocuments(
  packageName: string,
  documentType?: DocumentType,
  limit = 50
): Promise<{ items: DocumentItem[]; count: number }> {
  const response = await erpPost<
    { message?: { items: DocumentItem[]; count: number } },
    { package_name: string; document_type?: string; limit: number }
  >(TRANSFER_ENDPOINTS.package_documents, {
    package_name: packageName,
    document_type: documentType,
    limit,
  })
  if (!response.message) throw new Error('Belge listesi alinamadi')
  return response.message
}

export async function exportPackage(
  packageName: string,
  outputFormat?: string
): Promise<ExportResult> {
  const response = await erpPost<{ message?: ExportResult }, { package_name: string; output_format?: string }>(
    TRANSFER_ENDPOINTS.export,
    { package_name: packageName, output_format: outputFormat }
  )
  if (!response.message) throw new Error('Aktarim basarisiz')
  return response.message
}

export async function getTransferHistory(limit = 50): Promise<{ items: TransferPackage[] }> {
  const response = await erpPost<{ message?: { items: TransferPackage[] } }, { limit: number }>(
    TRANSFER_ENDPOINTS.history,
    { limit }
  )
  if (!response.message?.items) throw new Error('Gecmis alinamadi')
  return response.message
}

export async function getTransferErrors(packageName: string): Promise<{ items: TransferError[] }> {
  const response = await erpPost<{ message?: { items: TransferError[] } }, { package_name: string }>(
    TRANSFER_ENDPOINTS.errors,
    { package_name: packageName }
  )
  if (!response.message?.items) throw new Error('Hatalar alinamadi')
  return response.message
}

export async function deleteTransferPackage(packageName: string): Promise<{ status: string; message: string }> {
  const response = await erpPost<{ message?: { status: string; message: string } }, { package_name: string }>(
    TRANSFER_ENDPOINTS.delete_package,
    { package_name: packageName }
  )
  if (!response.message) throw new Error('Paket silinemedi')
  return response.message
}

export function downloadAsCsv(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(h => {
        const val = row[h]
        const str = val === null || val === undefined ? '' : String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    )
  ]
  
  const csvContent = csvRows.join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function formatPackageStatus(status: PackageStatus): string {
  const labels: Record<PackageStatus, string> = {
    'Draft': 'Taslak',
    'Ready': 'Hazir',
    'Exported': 'Aktarildi',
    'Error': 'Hata',
  }
  return labels[status] || status
}

export function getStatusColor(status: PackageStatus): string {
  const colors: Record<PackageStatus, string> = {
    'Draft': 'var(--color-muted)',
    'Ready': 'var(--color-warning)',
    'Exported': 'var(--color-success)',
    'Error': 'var(--color-error)',
  }
  return colors[status] || 'var(--color-muted)'
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount)
}