import { useEffect, useMemo, useState } from 'react'
import { PageSection } from '../../../shared/ui/PageSection'
import { formatTryCurrency } from '../../../shared/utils/format'
import {
  createChequeNote,
  getChequeNoteMaturityCalendar,
  getChequeNoteRiskSummary,
  listChequeNoteMovements,
  listChequeNotes,
  updateChequeNoteStatus,
  type ChequeNoteDirection,
  type ChequeNoteDraft,
  type ChequeNoteFilter,
  type ChequeNoteKind,
  type ChequeNoteMovementRow,
  type ChequeNoteRiskSummary,
  type ChequeNoteRow,
  type ChequeNoteStatus,
} from '../services/chequeNoteService'

const STATUS_OPTIONS: ChequeNoteStatus[] = ['Portfoyde', 'Tahsil Edildi', 'Ciro Edildi', 'Iade', 'Protesto']

export function ChequeNoteScreen() {
  const [rows, setRows] = useState<ChequeNoteRow[]>([])
  const [movements, setMovements] = useState<ChequeNoteMovementRow[]>([])
  const [riskSummary, setRiskSummary] = useState<ChequeNoteRiskSummary>({
    portfoy_alacak_riski: 0,
    portfoy_borc_riski: 0,
    net_risk: 0,
    open_count: 0,
  })
  const [calendarCount, setCalendarCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ChequeNoteFilter>({})
  const [statusNote, setStatusNote] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState<ChequeNoteDraft>({
    kind: 'Cek',
    direction: 'Musteriden',
    instrument_no: '',
    party: '',
    amount: 0,
  })

  const load = async () => {
    setIsLoading(true)
    try {
      const [noteRows, movementRows, summary, calendar] = await Promise.all([
        listChequeNotes(100, filter),
        listChequeNoteMovements(undefined, 20),
        getChequeNoteRiskSummary(),
        getChequeNoteMaturityCalendar(60),
      ])
      setRows(noteRows)
      setMovements(movementRows)
      setRiskSummary(summary)
      setCalendarCount(calendar.count)
    } catch {
      setError('Cek/Senet verileri alinamadi.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const applyFilter = async () => {
    await load()
  }

  const handleCreate = async () => {
    if (!draft.instrument_no.trim() || !draft.amount) {
      setError('Belge no ve tutar zorunludur.')
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      await createChequeNote(draft)
      setDraft({ kind: 'Cek', direction: 'Musteriden', instrument_no: '', party: '', amount: 0 })
      await load()
    } catch {
      setError('Cek/Senet kaydi olusturulamadi.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (name: string, status: ChequeNoteStatus) => {
    setIsSaving(true)
    setError(null)
    try {
      await updateChequeNoteStatus(name, status, statusNote[name] || undefined)
      await load()
    } catch {
      setError('Durum guncellenemedi.')
    } finally {
      setIsSaving(false)
    }
  }

  const totalAmount = useMemo(() => rows.reduce((sum, row) => sum + (row.amount || 0), 0), [rows])

  return (
    <PageSection title="Cek/Senet" subtitle="Portfoy, tahsil, ciro, iade, vade ve risk takibi">
      <div className="settings-overview">
        <div>
          <strong>{rows.length}</strong>
          <span>Liste Kaydi</span>
        </div>
        <div>
          <strong>{formatTryCurrency(totalAmount)}</strong>
          <span>Filtreli Toplam</span>
        </div>
        <div>
          <strong>{formatTryCurrency(riskSummary.net_risk)}</strong>
          <span>Net Risk</span>
        </div>
        <div>
          <strong>{calendarCount}</strong>
          <span>60 Gun Vade</span>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Durum Filtresi
          <select value={filter.status || ''} onChange={(e) => setFilter((p) => ({ ...p, status: (e.target.value || undefined) as ChequeNoteStatus | undefined }))}>
            <option value="">Hepsi</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          Belge Turu
          <select value={filter.kind || ''} onChange={(e) => setFilter((p) => ({ ...p, kind: (e.target.value || undefined) as ChequeNoteKind | undefined }))}>
            <option value="">Hepsi</option>
            <option value="Cek">Cek</option>
            <option value="Senet">Senet</option>
          </select>
        </label>
        <label>
          Yon
          <select value={filter.direction || ''} onChange={(e) => setFilter((p) => ({ ...p, direction: (e.target.value || undefined) as ChequeNoteDirection | undefined }))}>
            <option value="">Hepsi</option>
            <option value="Musteriden">Musteriden</option>
            <option value="Tedarikciye">Tedarikciye</option>
          </select>
        </label>
        <label>
          Cari Ara
          <input value={filter.party_query || ''} onChange={(e) => setFilter((p) => ({ ...p, party_query: e.target.value || undefined }))} />
        </label>
        <label>
          Vade Baslangic
          <input type="date" value={filter.due_from || ''} onChange={(e) => setFilter((p) => ({ ...p, due_from: e.target.value || undefined }))} />
        </label>
        <label>
          Vade Bitis
          <input type="date" value={filter.due_to || ''} onChange={(e) => setFilter((p) => ({ ...p, due_to: e.target.value || undefined }))} />
        </label>
      </div>
      <div className="toolbar">
        <button type="button" onClick={() => void applyFilter()} disabled={isSaving}>Filtre Uygula</button>
      </div>

      <div className="form-grid">
        <label>
          Belge Turu
          <select value={draft.kind} onChange={(e) => setDraft((p) => ({ ...p, kind: e.target.value as ChequeNoteDraft['kind'] }))}>
            <option value="Cek">Cek</option>
            <option value="Senet">Senet</option>
          </select>
        </label>
        <label>
          Yon
          <select value={draft.direction} onChange={(e) => setDraft((p) => ({ ...p, direction: e.target.value as ChequeNoteDraft['direction'] }))}>
            <option value="Musteriden">Musteriden</option>
            <option value="Tedarikciye">Tedarikciye</option>
          </select>
        </label>
        <label>
          Belge No
          <input value={draft.instrument_no} onChange={(e) => setDraft((p) => ({ ...p, instrument_no: e.target.value }))} />
        </label>
        <label>
          Cari
          <input value={draft.party || ''} onChange={(e) => setDraft((p) => ({ ...p, party: e.target.value }))} />
        </label>
        <label>
          Tutar
          <input type="number" value={draft.amount} onChange={(e) => setDraft((p) => ({ ...p, amount: Number(e.target.value || 0) }))} />
        </label>
        <label>
          Vade Tarihi
          <input type="date" value={draft.due_date || ''} onChange={(e) => setDraft((p) => ({ ...p, due_date: e.target.value }))} />
        </label>
      </div>
      <div className="toolbar">
        <button type="button" onClick={() => void handleCreate()} disabled={isSaving}>
          {isSaving ? 'Kaydediliyor...' : 'Cek/Senet Ekle'}
        </button>
      </div>

      {isLoading ? <p className="muted">Kayitlar yukleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Belge</th>
              <th>Cari</th>
              <th>Vade</th>
              <th>Tutar</th>
              <th>Durum</th>
              <th>Durum Notu</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.kind} - {row.instrument_no}</td>
                <td>{row.party || '-'}</td>
                <td>{row.due_date || '-'}</td>
                <td>{formatTryCurrency(row.amount)}</td>
                <td>
                  <select
                    value={row.status}
                    onChange={(e) => void handleStatusChange(row.name, e.target.value as ChequeNoteStatus)}
                    disabled={isSaving}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    value={statusNote[row.name] || ''}
                    onChange={(e) => setStatusNote((prev) => ({ ...prev, [row.name]: e.target.value }))}
                    placeholder="Opsiyonel not"
                    disabled={isSaving}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="record-list compact">
        <h4 className="subsection-title">Son Hareketler</h4>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Zaman</th>
                <th>Kayit</th>
                <th>Hareket</th>
                <th>Durum</th>
                <th>Kullanici</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.name}>
                  <td>{movement.moved_at || '-'}</td>
                  <td>{movement.cheque_note}</td>
                  <td>{movement.movement_type}</td>
                  <td>{movement.from_status ? `${movement.from_status} -> ${movement.to_status}` : movement.to_status}</td>
                  <td>{movement.moved_by || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageSection>
  )
}
