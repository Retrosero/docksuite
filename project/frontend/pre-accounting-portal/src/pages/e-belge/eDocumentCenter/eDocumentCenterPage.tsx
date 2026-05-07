import { useCallback, useEffect, useState } from 'react'
import type { RoutePageProps } from '../../../app/pageProps'
import { PageSection } from '../../../shared/ui/PageSection'
import {
  type EDocument,
  type DocumentHistoryLog,
  getSentDocuments,
  getReceivedDocuments,
  getDocumentHistory,
  syncDocumentStatus,
  resendDocument,
  rejectDocument,
  cancelDocument,
  returnDocument,
  convertIncomingToPurchaseInvoice,
  retryFailedDocuments,
  getRetryMonitor,
  formatStatus,
  getStatusColor,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '../../../features/e-document/services/eDocumentService'

type Direction = 'outgoing' | 'incoming'

export function EDocumentCenterPage({}: RoutePageProps) {
  const [activeDirection, setActiveDirection] = useState<Direction>('outgoing')
  const [documents, setDocuments] = useState<EDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<EDocument | null>(null)
  const [history, setHistory] = useState<DocumentHistoryLog[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionModal, setActionModal] = useState<{ type: 'reject' | 'cancel' | 'return'; doc: EDocument } | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [lastInfo, setLastInfo] = useState<string | null>(null)
  const [retryMonitor, setRetryMonitor] = useState<{ summary: { tracked_count: number; retry_total: number; error_count: number }; items: Array<{ invoice: string; status: string; retry_count: number; last_retry_at: string }> } | null>(null)

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = activeDirection === 'outgoing'
        ? await getSentDocuments()
        : await getReceivedDocuments()
      setDocuments(result.items)
      if (activeDirection === 'outgoing') {
        const monitor = await getRetryMonitor(10)
        setRetryMonitor(monitor)
      }
    } catch {
      setError('Belgeler yuklenemedi.')
    } finally {
      setIsLoading(false)
    }
  }, [activeDirection])

  useEffect(() => {
    void fetchDocuments()
  }, [fetchDocuments])

  const handleViewDetails = async (doc: EDocument) => {
    setSelectedDoc(doc)
    setIsHistoryLoading(true)
    try {
      const result = await getDocumentHistory(doc.erp_document_name, doc.erp_document_type)
      setHistory(result.logs)
    } catch {
      setHistory([])
    } finally {
      setIsHistoryLoading(false)
    }
  }

  const handleSync = async (doc: EDocument) => {
    setActionLoading(doc.id)
    try {
      const result = await syncDocumentStatus(doc.erp_document_name)
      if (result.status === 'ok') {
        await fetchDocuments()
      } else {
        setError(result.message || 'Senkronizasyon basarisiz.')
      }
    } catch {
      setError('Senkronizasyon hatasi.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResend = async (doc: EDocument) => {
    setActionLoading(doc.id)
    try {
      const result = await resendDocument(doc.erp_document_name, doc.erp_document_type)
      if (result.status === 'ok') {
        await fetchDocuments()
      } else {
        setError(result.message || 'Tekrar gonderim basarisiz.')
      }
    } catch {
      setError('Tekrar gonderim hatasi.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleConvertIncoming = async (doc: EDocument) => {
    setActionLoading(doc.id)
    setError(null)
    setLastInfo(null)
    try {
      const result = await convertIncomingToPurchaseInvoice(doc.id)
      if (result.status === 'ok') {
        const invoiceInfo = result.purchase_invoice ? ` (${result.purchase_invoice})` : ''
        setLastInfo((result.message || 'Belge alis faturasina donusturuldu.') + invoiceInfo)
        await fetchDocuments()
      } else {
        setError(result.message || 'Donusum basarisiz.')
      }
    } catch {
      setError('Donusum hatasi.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRetryFailed = async () => {
    setActionLoading('bulk-retry')
    setError(null)
    setLastInfo(null)
    try {
      const result = await retryFailedDocuments(20)
      if (result.status === 'ok') {
        setLastInfo(result.message || 'Hata durumundaki belgeler tekrar denendi.')
        await fetchDocuments()
      } else {
        setError(result.message || 'Toplu tekrar deneme basarisiz.')
      }
    } catch {
      setError('Toplu tekrar deneme hatasi.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAction = async () => {
    if (!actionModal) return
    setActionLoading(actionModal.doc.id)
    try {
      let result
      const { type, doc } = actionModal
      if (type === 'reject') result = await rejectDocument(doc.erp_document_name, actionReason, doc.erp_document_type)
      else if (type === 'cancel') result = await cancelDocument(doc.erp_document_name, actionReason, doc.erp_document_type)
      else result = await returnDocument(doc.erp_document_name, actionReason, doc.erp_document_type)
      
      if (result.status === 'ok') {
        setActionModal(null)
        setActionReason('')
        await fetchDocuments()
      } else {
        setError(result.message || 'Islem basarisiz.')
      }
    } catch {
      setError('Islem hatasi.')
    } finally {
      setActionLoading(null)
    }
  }

  const closeModal = () => {
    setSelectedDoc(null)
    setHistory([])
    setActionModal(null)
    setActionReason('')
  }

  return (
    <PageSection title="E-Belge Merkezi" subtitle="Gelen ve giden e-belge yonetimi">
      <div className="settings-overview">
        <div>
          <strong>{documents.length}</strong>
          <span>Belge Sayisi</span>
        </div>
        <div>
          <strong>{documents.filter((d) => d.document_type === 'e-Irsaliye').length}</strong>
          <span>e-Irsaliye</span>
        </div>
        <div>
          <strong>{documents.filter((d) => d.nes_status === 'Error').length}</strong>
          <span>Hata Durumu</span>
        </div>
        <div>
          <strong>{documents.filter((d) => d.can_convert).length}</strong>
          <span>Donusturulebilir</span>
        </div>
      </div>

      {/* Direction Tabs */}
      <div className="toolbar-tabs">
        <button
          type="button"
          className={activeDirection === 'outgoing' ? '' : 'ghost'}
          onClick={() => setActiveDirection('outgoing')}
        >
          <span className="tab-label">Giden Belgeler</span>
          <span className="tab-count">{documents.length}</span>
        </button>
        <button
          type="button"
          className={activeDirection === 'incoming' ? '' : 'ghost'}
          onClick={() => setActiveDirection('incoming')}
        >
          <span className="tab-label">Gelen Belgeler</span>
          <span className="tab-count">{documents.length}</span>
        </button>
      </div>

      {/* Refresh Button */}
      <div className="toolbar">
        <button type="button" onClick={() => void fetchDocuments()} disabled={isLoading}>
          {isLoading ? 'Yukleniyor...' : 'Yenile'}
        </button>
        {activeDirection === 'outgoing' ? (
          <button
            type="button"
            className="ghost"
            onClick={() => void handleRetryFailed()}
            disabled={actionLoading === 'bulk-retry'}
          >
            {actionLoading === 'bulk-retry' ? 'Calisiyor...' : 'Hatali Belgeleri Tekrar Dene'}
          </button>
        ) : null}
      </div>

      {/* Error Message */}
      {error ? <p className="error-text">{error}</p> : null}
      {lastInfo ? <p className="success-text">{lastInfo}</p> : null}
      {activeDirection === 'outgoing' && retryMonitor ? (
        <div className="record-list compact">
          <h4 className="subsection-title">
            Retry Monitor (Toplam: {retryMonitor.summary.retry_total}, Hata: {retryMonitor.summary.error_count})
          </h4>
          {retryMonitor.items.slice(0, 5).map((row) => (
            <div key={row.invoice} className="record-card">
              <div>
                <strong>{row.invoice}</strong>
                <span>Durum: {row.status}</span>
              </div>
              <div>
                <strong>Retry: {row.retry_count}</strong>
                <span>{row.last_retry_at ? formatDateTime(row.last_retry_at) : '-'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Document List */}
      {isLoading ? (
        <p className="muted">Belgeler yukleniyor...</p>
      ) : documents.length === 0 ? (
        <p className="muted">Henuz belge bulunmuyor.</p>
      ) : (
        <div className="document-list">
          {documents.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="document-header">
                <div className="document-title">
                  <span className="document-type">{doc.document_type}</span>
                  <span className="document-name">{doc.erp_document_name}</span>
                </div>
                <span
                  className="document-status"
                  style={{ color: getStatusColor(doc.nes_status) }}
                >
                  {formatStatus(doc.nes_status)}
                </span>
              </div>

              <div className="document-body">
                {doc.customer_name && (
                  <div className="document-field">
                    <span className="field-label">Cari:</span>
                    <span className="field-value">{doc.customer_name}</span>
                  </div>
                )}
                <div className="document-field">
                  <span className="field-label">Tarih:</span>
                  <span className="field-value">{formatDate(doc.posting_date)}</span>
                </div>
                <div className="document-field">
                  <span className="field-label">Tutar:</span>
                  <span className="field-value">{formatCurrency(doc.grand_total, doc.currency)}</span>
                </div>
                {doc.nes_uuid && (
                  <div className="document-field">
                    <span className="field-label">UUID:</span>
                    <span className="field-value uuid">{doc.nes_uuid}</span>
                  </div>
                )}
                {doc.last_sync_at && (
                  <div className="document-field">
                    <span className="field-label">Son Islem:</span>
                    <span className="field-value">{formatDateTime(doc.last_sync_at)}</span>
                  </div>
                )}
                {typeof doc.retry_count === 'number' && doc.retry_count > 0 && (
                  <div className="document-field">
                    <span className="field-label">Retry:</span>
                    <span className="field-value">{doc.retry_count}</span>
                  </div>
                )}
                {doc.last_retry_at && (
                  <div className="document-field">
                    <span className="field-label">Son Retry:</span>
                    <span className="field-value">{formatDateTime(doc.last_retry_at)}</span>
                  </div>
                )}
                {doc.linked_purchase_invoice && (
                  <div className="document-field">
                    <span className="field-label">Alis Faturasi:</span>
                    <span className="field-value">{doc.linked_purchase_invoice}</span>
                  </div>
                )}
              </div>

              <div className="document-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={() => void handleViewDetails(doc)}
                >
                  Detay
                </button>
                {doc.can_sync && (
                  <button
                    type="button"
                    className="ghost"
                    disabled={actionLoading === doc.id}
                    onClick={() => void handleSync(doc)}
                  >
                    {actionLoading === doc.id ? '...' : 'Senkronize Et'}
                  </button>
                )}
                {doc.can_send && (
                  <button
                    type="button"
                    disabled={actionLoading === doc.id}
                    onClick={() => void handleResend(doc)}
                  >
                    {actionLoading === doc.id ? '...' : 'Tekrar Gonder'}
                  </button>
                )}
                {doc.can_reject && (
                  <button
                    type="button"
                    className="danger"
                    disabled={actionLoading === doc.id}
                    onClick={() => setActionModal({ type: 'reject', doc })}
                  >
                    Reddet
                  </button>
                )}
                {doc.can_cancel && (
                  <button
                    type="button"
                    className="danger"
                    disabled={actionLoading === doc.id}
                    onClick={() => setActionModal({ type: 'cancel', doc })}
                  >
                    Iptal Et
                  </button>
                )}
                {doc.can_convert && (
                  <button
                    type="button"
                    className="ghost"
                    disabled={actionLoading === doc.id}
                    onClick={() => void handleConvertIncoming(doc)}
                  >
                    {actionLoading === doc.id ? '...' : 'Alis Faturasina Donustur'}
                  </button>
                )}
                {!doc.can_convert && doc.linked_purchase_invoice && (
                  <button type="button" className="ghost" disabled>
                    Donusum Tamamlandi
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Belge Detay: {selectedDoc.erp_document_name}</h3>
              <button type="button" className="close-btn" onClick={closeModal}>X</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Belge Turu</span>
                  <span className="detail-value">{selectedDoc.document_type}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Durum</span>
                  <span className="detail-value" style={{ color: getStatusColor(selectedDoc.nes_status) }}>
                    {formatStatus(selectedDoc.nes_status)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">UUID</span>
                  <span className="detail-value">{selectedDoc.nes_uuid || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tarih</span>
                  <span className="detail-value">{formatDate(selectedDoc.posting_date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tutar</span>
                  <span className="detail-value">{formatCurrency(selectedDoc.grand_total, selectedDoc.currency)}</span>
                </div>
              </div>

              <h4>Belge Gecmisi</h4>
              {isHistoryLoading ? (
                <p className="muted">Gecmis yukleniyor...</p>
              ) : history.length === 0 ? (
                <p className="muted">Gecmis kaydi yok.</p>
              ) : (
                <div className="timeline">
                  {history.map((log) => (
                    <div key={log.name} className="timeline-item">
                      <div className="timeline-marker" style={{ backgroundColor: getStatusColor(log.nes_status) }} />
                      <div className="timeline-content">
                        <span className="timeline-status">{formatStatus(log.nes_status)}</span>
                        {log.direction_status && (
                          <span className="timeline-direction"> - {log.direction_status}</span>
                        )}
                        <span className="timeline-time">{formatDateTime(log.last_sync_at || '')}</span>
                        {log.error_message && (
                          <p className="timeline-error">{log.error_message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {actionModal.type === 'reject' ? 'Reddet' : actionModal.type === 'cancel' ? 'Iptal Et' : 'Iade Et'}
              </h3>
              <button type="button" className="close-btn" onClick={closeModal}>X</button>
            </div>
            <div className="modal-body">
              <p>
                <strong>{actionModal.doc.erp_document_name}</strong> belgesini{' '}
                {actionModal.type === 'reject' ? 'reddetmek' : actionModal.type === 'cancel' ? 'iptal etmek' : 'iade etmek'}{' '}
                istediginize emin misiniz?
              </p>
              <div className="form-group">
                <label htmlFor="action-reason">Sebep (opsiyonel):</label>
                <textarea
                  id="action-reason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Islem sebebini girin..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="ghost" onClick={closeModal}>
                Iptal
              </button>
              <button
                type="button"
                className="danger"
                disabled={actionLoading === actionModal.doc.id}
                onClick={() => void handleAction()}
              >
                {actionLoading === actionModal.doc.id ? 'Isleniyor...' : 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageSection>
  )
}
