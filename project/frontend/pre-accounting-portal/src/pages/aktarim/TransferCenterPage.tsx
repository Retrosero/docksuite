import { useEffect, useState } from 'react'
import type { RoutePageProps } from '../../app/pageProps'
import { PageSection } from '../../shared/ui/PageSection'
import {
  type SoftwareInfo,
  type TransferPackage,
  type DocumentItem,
  type DocumentType,
  type TransferSoftware,
  getTransferSoftwareList,
  getTransferHistory,
  createTransferPackage,
  exportPackage,
  getPackageDocuments,
  downloadAsCsv,
  formatPackageStatus,
  getStatusColor,
  formatDate,
  formatCurrency,
} from '../../features/transfer/services/transferService'

export function TransferCenterPage({}: RoutePageProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create')
  const [softwareList, setSoftwareList] = useState<SoftwareInfo[]>([])
  const [selectedSoftware, setSelectedSoftware] = useState<TransferSoftware | null>(null)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [selectedDocTypes, setSelectedDocTypes] = useState<DocumentType[]>([
    'Sales Invoice',
    'Purchase Invoice',
  ])
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // History state
  const [history, setHistory] = useState<TransferPackage[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Package detail state
  const [selectedPackage, setSelectedPackage] = useState<TransferPackage | null>(null)
  const [packageDocuments, setPackageDocuments] = useState<DocumentItem[]>([])
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    void loadSoftwareList()
    void loadHistory()
  }, [])

  const loadSoftwareList = async () => {
    try {
      const result = await getTransferSoftwareList()
      setSoftwareList(result.items)
    } catch {
      setError('Yazilim listesi yuklenemedi.')
    }
  }

  const loadHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const result = await getTransferHistory()
      setHistory(result.items)
    } catch {
      setError('Gecmis yuklenemedi.')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleCreatePackage = async () => {
    if (!periodStart || !periodEnd) {
      setError('Donem tarihleri zorunludur.')
      return
    }

    setIsCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await createTransferPackage(
        selectedSoftware,
        periodStart,
        periodEnd,
        selectedDocTypes
      )
      setSuccess(`Paket olusturuldu: ${result.package} (${result.record_count} kayit)`)
      await loadHistory()
      setActiveTab('history')
    } catch {
      setError('Paket olusturulamadi.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleViewPackage = async (pkg: TransferPackage) => {
    setSelectedPackage(pkg)
    try {
      const result = await getPackageDocuments(pkg.name)
      setPackageDocuments(result.items)
    } catch {
      setPackageDocuments([])
    }
  }

  const handleExport = async (pkg: TransferPackage) => {
    setIsExporting(true)
    try {
      const result = await exportPackage(pkg.name)
      if (result.data?.rows?.length) {
        const filename = `aktarim-${pkg.name}-${formatDate(pkg.period_start)}`
        downloadAsCsv(result.data.rows, filename)
        setSuccess(`${result.record_count} kayit aktarildi.`)
      }
    } catch {
      setError('Aktarim basarisiz.')
    } finally {
      setIsExporting(false)
    }
  }

  const closeModal = () => {
    setSelectedPackage(null)
    setPackageDocuments([])
  }

  const toggleDocType = (docType: DocumentType) => {
    setSelectedDocTypes((prev) =>
      prev.includes(docType)
        ? prev.filter((d) => d !== docType)
        : [...prev, docType]
    )
  }

  const getDocumentTypeLabel = (dt: string): string => {
    const labels: Record<string, string> = {
      'Sales Invoice': 'Satis Faturasi',
      'Purchase Invoice': 'Alis Faturasi',
      'Payment Entry': 'Odeme Kaydi',
      'Journal Entry': 'Yevmiye Kaydi',
    }
    return labels[dt] || dt
  }

  return (
    <PageSection title="Aktarim Merkezi" subtitle="Muhasebe yazilimlarina veri aktarimi">
      {/* Tab Navigation */}
      <div className="toolbar-tabs">
        <button
          type="button"
          className={activeTab === 'create' ? '' : 'ghost'}
          onClick={() => setActiveTab('create')}
        >
          <span className="tab-label">Yeni Aktarim</span>
        </button>
        <button
          type="button"
          className={activeTab === 'history' ? '' : 'ghost'}
          onClick={() => setActiveTab('history')}
        >
          <span className="tab-label">Gecmis</span>
          <span className="tab-count">{history.length}</span>
        </button>
      </div>

      {/* Messages */}
      {error ? <p className="error-text">{error}</p> : null}
      {success ? <p className="success-text">{success}</p> : null}

      {/* Create Package Tab */}
      {activeTab === 'create' && (
        <div className="form-section">
          <h4>Yazilim Secimi</h4>
          <div className="software-grid">
            {softwareList.map((sw) => (
              <div
                key={sw.id}
                className={`software-card ${selectedSoftware === sw.id ? 'selected' : ''}`}
                onClick={() => setSelectedSoftware(sw.id)}
              >
                <div className="software-name">{sw.name}</div>
                <div className="software-format">{sw.format}</div>
                <div className="software-features">
                  {sw.features.map((f) => (
                    <span key={f} className="feature-tag">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <h4>Donem Secimi</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="period-start">Baslangic</label>
              <input
                type="date"
                id="period-start"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="period-end">Bitis</label>
              <input
                type="date"
                id="period-end"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          <h4>Belge Turleri</h4>
          <div className="doc-type-list">
            {(['Sales Invoice', 'Purchase Invoice', 'Payment Entry', 'Journal Entry'] as DocumentType[]).map((dt) => (
              <label key={dt} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedDocTypes.includes(dt)}
                  onChange={() => toggleDocType(dt)}
                />
                {getDocumentTypeLabel(dt)}
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => void handleCreatePackage()}
              disabled={isCreating || !periodStart || !periodEnd}
            >
              {isCreating ? 'Olusturuluyor...' : 'Paket Olustur'}
            </button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="history-section">
          {isLoadingHistory ? (
            <p className="muted">Gecmis yukleniyor...</p>
          ) : history.length === 0 ? (
            <p className="muted">Henuz aktarim yok.</p>
          ) : (
            <div className="package-list">
              {history.map((pkg) => (
                <div key={pkg.name} className="package-card">
                  <div className="package-header">
                    <div className="package-info">
                      <span className="package-name">{pkg.name}</span>
                      <span
                        className="package-status"
                        style={{ color: getStatusColor(pkg.status) }}
                      >
                        {formatPackageStatus(pkg.status)}
                      </span>
                    </div>
                    <span className="package-period">
                      {formatDate(pkg.period_start)} - {formatDate(pkg.period_end)}
                    </span>
                  </div>

                  <div className="package-body">
                    <div className="package-stats">
                      <div className="stat">
                        <span className="stat-label">Kayit</span>
                        <span className="stat-value">{pkg.record_count}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Hata</span>
                        <span className="stat-value error">{pkg.error_count}</span>
                      </div>
                    </div>

                    <div className="doc-type-summary">
                      {pkg.document_types?.map((item) => (
                        <span key={item.document_type} className="doc-type-badge">
                          {getDocumentTypeLabel(item.document_type)}: {item.record_count}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="package-actions">
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => void handleViewPackage(pkg)}
                    >
                      Detay
                    </button>
                    {pkg.status === 'Draft' && (
                      <button
                        type="button"
                        disabled={isExporting}
                        onClick={() => void handleExport(pkg)}
                      >
                        {isExporting ? 'Aktariliyor...' : 'Aktar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Paket Detay: {selectedPackage.name}</h3>
              <button type="button" className="close-btn" onClick={closeModal}>X</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Durum</span>
                  <span className="detail-value" style={{ color: getStatusColor(selectedPackage.status) }}>
                    {formatPackageStatus(selectedPackage.status)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Donem</span>
                  <span className="detail-value">
                    {formatDate(selectedPackage.period_start)} - {formatDate(selectedPackage.period_end)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Kayit Sayisi</span>
                  <span className="detail-value">{selectedPackage.record_count}</span>
                </div>
              </div>

              <h4>Belgeler ({packageDocuments.length})</h4>
              {packageDocuments.length === 0 ? (
                <p className="muted">Belge yok.</p>
              ) : (
                <div className="document-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Belge</th>
                        <th>Tarih</th>
                        <th>Tip</th>
                        <th>Tutar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packageDocuments.map((doc) => (
                        <tr key={doc.name}>
                          <td>{doc.name}</td>
                          <td>{formatDate(doc.posting_date)}</td>
                          <td>{getDocumentTypeLabel(doc.document_type)}</td>
                          <td>{formatCurrency(doc.grand_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="ghost" onClick={closeModal}>
                Kapat
              </button>
              {selectedPackage.status === 'Draft' && (
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => void handleExport(selectedPackage)}
                >
                  {isExporting ? 'Aktariliyor...' : 'Aktar ve Indir'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </PageSection>
  )
}