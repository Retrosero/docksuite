import { useEffect, useMemo, useState } from 'react'
import {
  fetchNesPortalConfig,
  fetchNesPortalQueue,
  saveNesPortalConfig,
  sendInvoiceToNes,
  syncNesInvoiceStatus,
  type NesPortalConfig,
  type NesPortalQueueItem,
} from '../services/nesPortalSettingsService'

const EMPTY_CONFIG: NesPortalConfig = {
  enabled: 0,
  base_url: 'https://api.nes.com.tr',
  send_path: '/fatura/olustur',
  status_path: '/fatura/durum/{uuid}',
  username: '',
  access_token: '',
  sandbox: 1,
}

function formatMoney(value: number, currency?: string) {
  return `${Number(value || 0).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency || 'TRY'}`
}

function statusTone(status?: string) {
  if (status === 'Accepted' || status === 'Sent') return 'success'
  if (status === 'Rejected' || status === 'Error') return 'warning'
  return 'neutral'
}

export function NesPortalSettingsPanel() {
  const [config, setConfig] = useState<NesPortalConfig>(EMPTY_CONFIG)
  const [queue, setQueue] = useState<NesPortalQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [busyInvoice, setBusyInvoice] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const queueSummary = useMemo(() => {
    const waiting = queue.filter((item) => ['Not Sent', 'Queued', 'Error', undefined].includes(item.nes_portal_status)).length
    const completed = queue.filter((item) => ['Sent', 'Accepted'].includes(item.nes_portal_status || '')).length
    return { waiting, completed }
  }, [queue])

  const loadPanel = async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const [nextConfig, nextQueue] = await Promise.all([fetchNesPortalConfig(), fetchNesPortalQueue()])
      setConfig(nextConfig)
      setQueue(nextQueue.items)
    } catch {
      setMessage('NES Portal bilgileri yuklenemedi.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadPanel()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)
    try {
      const saved = await saveNesPortalConfig(config)
      setConfig(saved)
      setMessage('NES Portal ayarlari kaydedildi.')
    } catch {
      setMessage('NES Portal ayarlari kaydedilemedi.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async (invoiceName: string) => {
    setBusyInvoice(invoiceName)
    setMessage(null)
    try {
      const result = await sendInvoiceToNes(invoiceName)
      setMessage(result.status === 'ok' ? 'Fatura NES Portal tarafina gonderildi.' : result.message || 'Gonderim tamamlanamadi.')
      await loadPanel()
    } catch {
      setMessage('Fatura NES Portal tarafina gonderilemedi.')
    } finally {
      setBusyInvoice(null)
    }
  }

  const handleSync = async (invoiceName: string) => {
    setBusyInvoice(invoiceName)
    setMessage(null)
    try {
      const result = await syncNesInvoiceStatus(invoiceName)
      setMessage(result.status === 'ok' ? 'NES Portal durumu guncellendi.' : result.message || 'Durum sorgusu tamamlanamadi.')
      await loadPanel()
    } catch {
      setMessage('NES Portal durumu sorgulanamadi.')
    } finally {
      setBusyInvoice(null)
    }
  }

  return (
    <section className="go-live-panel" aria-labelledby="nes-portal-title">
      <div className="setting-group-head">
        <div>
          <h3 id="nes-portal-title">NES Portal e-Belge Entegrasyonu</h3>
          <p>e-Fatura, e-Arsiv ve sonraki resmi e-belge akislarinin NES Portal API uzerinden yonetimi.</p>
        </div>
        <span>{config.enabled ? 'Aktif' : 'Kapali'}</span>
      </div>

      <div className="settings-overview">
        <div>
          <strong>{queueSummary.waiting}</strong>
          <span>Gonderim bekleyen</span>
        </div>
        <div>
          <strong>{queueSummary.completed}</strong>
          <span>NES tarafina aktarilan</span>
        </div>
        <div>
          <strong>{config.sandbox ? 'Test' : 'Canli'}</strong>
          <span>Ortam</span>
        </div>
      </div>

      <div className="form-grid quick-form-grid">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={Boolean(config.enabled)}
            onChange={(event) => setConfig((prev) => ({ ...prev, enabled: event.target.checked ? 1 : 0 }))}
          />
          Entegrasyonu aktif et
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={Boolean(config.sandbox)}
            onChange={(event) => setConfig((prev) => ({ ...prev, sandbox: event.target.checked ? 1 : 0 }))}
          />
          Test ortaminda calis
        </label>
      </div>

      <div className="form-grid quick-form-grid">
        <label>
          API Base URL
          <input value={config.base_url} onChange={(event) => setConfig((prev) => ({ ...prev, base_url: event.target.value }))} />
        </label>
        <label>
          Gonderim Yolu
          <input value={config.send_path} onChange={(event) => setConfig((prev) => ({ ...prev, send_path: event.target.value }))} />
        </label>
        <label>
          Durum Yolu
          <input
            value={config.status_path}
            onChange={(event) => setConfig((prev) => ({ ...prev, status_path: event.target.value }))}
          />
        </label>
        <label>
          Kullanici / Client ID
          <input value={config.username} onChange={(event) => setConfig((prev) => ({ ...prev, username: event.target.value }))} />
        </label>
        <label>
          Access Token
          <input
            type="password"
            value={config.access_token}
            onChange={(event) => setConfig((prev) => ({ ...prev, access_token: event.target.value }))}
          />
        </label>
      </div>

      <div className="toolbar">
        <button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Kaydediliyor...' : 'NES Ayarlarini Kaydet'}
        </button>
        <button type="button" className="ghost" onClick={() => void loadPanel()} disabled={isLoading}>
          Kuyrugu Yenile
        </button>
      </div>
      {message ? <p className="muted">{message}</p> : null}

      <div className="record-list compact">
        <h4 className="subsection-title">Son Kesilmis Faturalar</h4>
        {isLoading ? <p className="muted">NES Portal kuyrugu yukleniyor...</p> : null}
        {!isLoading && !queue.length ? <p className="muted">Gonderime uygun kesilmis satis faturasi bulunamadi.</p> : null}
        {queue.slice(0, 8).map((item) => (
          <div key={item.name} className="record-card">
            <div>
              <strong>{item.name}</strong>
              <span>
                {item.customer_name || item.customer} - {item.posting_date} - {formatMoney(item.grand_total, item.currency)}
              </span>
              {item.nes_portal_error ? <span className="error-text">{item.nes_portal_error}</span> : null}
            </div>
            <div>
              <span className={`status-pill ${statusTone(item.nes_portal_status)}`}>{item.nes_portal_status || 'Not Sent'}</span>
              <div className="toolbar">
                <button type="button" onClick={() => void handleSend(item.name)} disabled={!item.can_send || busyInvoice === item.name}>
                  Gonder
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => void handleSync(item.name)}
                  disabled={!item.can_sync || busyInvoice === item.name}
                >
                  Durum Al
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
