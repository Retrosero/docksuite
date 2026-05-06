import { useEffect, useState } from 'react'
import { formatTryCurrency } from '../../shared/utils/format'
import { PageSection } from '../../shared/ui/PageSection'
import { fetchPendingApprovals, fetchApprovalTimeline, approveRequest, rejectRequest, formatDocumentTypeLabel, formatApprovalLevel } from '../../features/approvals/services/approvalService'

export function ApprovalQueuePage() {
  const [approvals, setApprovals] = useState<Awaited<ReturnType<typeof fetchPendingApprovals>>>([])
  const [timeline, setTimeline] = useState<Awaited<ReturnType<typeof fetchApprovalTimeline>>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const loadApprovals = async () => {
    setIsLoading(true)
    try {
      const data = await fetchPendingApprovals()
      const timelineData = await fetchApprovalTimeline(50)
      setApprovals(data)
      setTimeline(timelineData)
      setError(null)
    } catch {
      setError('Onay bekleyen işler yüklenemedi.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadApprovals()
  }, [])

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
                <span>Neden: {item.source_reason ?? 'Tutar bazlı onay'}</span>
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
      <section className="panel">
        <h3>Onay Gecmisi</h3>
        {timeline.length === 0 ? (
          <p className="muted">Kayit bulunmuyor.</p>
        ) : (
          <div className="record-list">
            {timeline.map((item) => (
              <article key={`timeline-${item.name}`} className="record-card">
                <div>
                  <strong>{formatDocumentTypeLabel(item.document_type)}</strong>
                  <span>Belge: {item.document_name}</span>
                  <span>Durum: {item.status}</span>
                  <span>Tutar: {formatTryCurrency(item.amount)}</span>
                  <span>Seviye: {formatApprovalLevel(item.approval_level)}</span>
                  <span>Isteyen: {item.requested_by}</span>
                  {item.approved_by ? <span>Isleyen: {item.approved_by}</span> : null}
                  {item.rejection_reason ? <span>Red sebebi: {item.rejection_reason}</span> : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageSection>
  )
}
