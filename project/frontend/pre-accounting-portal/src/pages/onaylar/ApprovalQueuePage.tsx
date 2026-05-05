import { useState } from 'react'
import { formatTryCurrency } from '../../shared/utils/format'
import { PageSection } from '../../shared/ui/PageSection'
import { fetchPendingApprovals, approveRequest, rejectRequest, formatDocumentTypeLabel, formatApprovalLevel } from '../../features/approvals/services/approvalService'

export function ApprovalQueuePage() {
  const [approvals, setApprovals] = useState<Awaited<ReturnType<typeof fetchPendingApprovals>>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const loadApprovals = async () => {
    setIsLoading(true)
    try {
      const data = await fetchPendingApprovals()
      setApprovals(data)
      setError(null)
    } catch {
      setError('Onay bekleyen işler yüklenemedi.')
    } finally {
      setIsLoading(false)
    }
  }

  useState(() => {
    void loadApprovals()
  })

  const handleApprove = async (name: string) => {
    try {
      const ok = await approveRequest(name)
      if (ok) {
        void loadApprovals()
      }
    } catch {
      setError('Onaylama işlemi başarısız.')
    }
  }

  const handleReject = async (name: string) => {
    if (!rejectReason.trim()) {
      setError('Red sebebi zorunludur.')
      return
    }
    try {
      const ok = await rejectRequest(name, rejectReason)
      if (ok) {
        setRejectingId(null)
        setRejectReason('')
        void loadApprovals()
      }
    } catch {
      setError('Reddetme işlemi başarısız.')
    }
  }

  return (
    <PageSection title="Onay Bekleyen İşler" subtitle="Yüksek tutarlı işlemler için onay listesi">
      {isLoading ? (
        <p className="muted">Onay bekleyen işler yükleniyor...</p>
      ) : approvals.length === 0 ? (
        <p className="muted">Onay bekleyen iş bulunmuyor.</p>
      ) : (
        <div className="record-list">
          {approvals.map((item) => (
            <article key={item.name} className="record-card">
              <div>
                <strong>{formatDocumentTypeLabel(item.document_type)}</strong>
                <span>Belge: {item.document_name}</span>
                <span>Tutar: {formatTryCurrency(item.amount)}</span>
                <span>Öncelik: {formatApprovalLevel(item.approval_level)}</span>
                <span>İsteyen: {item.requested_by}</span>
              </div>
              <div className="quick-entry-stack">
                {rejectingId === item.name ? (
                  <div className="form-grid">
                    <input
                      type="text"
                      placeholder="Red sebebi"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <button type="button" onClick={() => void handleReject(item.name)}>Reddet</button>
                    <button type="button" className="ghost" onClick={() => setRejectingId(null)}>İptal</button>
                  </div>
                ) : (
                  <>
                    <button type="button" onClick={() => void handleApprove(item.name)}>
                      Onayla
                    </button>
                    <button type="button" className="ghost" onClick={() => setRejectingId(item.name)}>
                      Reddet
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {error ? <p className="error-text">{error}</p> : null}
    </PageSection>
  )
}
