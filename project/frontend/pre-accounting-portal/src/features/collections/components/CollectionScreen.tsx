import { useMemo, useState } from 'react'
import { useQueryBackedFilter } from '../../../shared/hooks/useQueryBackedFilter'
import { validateCollectionForm } from '../../../shared/utils/formValidation'
import { formatTryCurrency } from '../../../shared/utils/format'
import { MobileStepFlow } from '../../../shared/ui/MobileStepFlow'
import { PageSection } from '../../../shared/ui/PageSection'
import { useCollectionData } from '../hooks/useCollectionData'
import { formatApprovalStatusLabel } from '../../approvals/services/approvalService'
import type { PaymentEntryForm } from '../types'

export function CollectionScreen() {
  const [activeEntryStep, setActiveEntryStep] = useState('fatura')
  const [message, setMessage] = useState<string | null>(null)
  const [closureFilterRaw, setClosureFilterRaw] = useQueryBackedFilter({
    queryKey: 'closure',
    storageKey: 'collection_filter_closure',
    defaultValue: 'Hepsi',
    allowedValues: ['Hepsi', 'Tam Kapandı', 'Kısmi Tahsilat'],
  })
  const [invoiceSearch, setInvoiceSearch] = useQueryBackedFilter({
    queryKey: 'invoice',
    storageKey: 'collection_filter_invoice',
    defaultValue: '',
  })
  const [partySearch, setPartySearch] = useQueryBackedFilter({
    queryKey: 'party',
    storageKey: 'collection_filter_party',
    defaultValue: '',
  })
  const closureFilter = closureFilterRaw as 'Hepsi' | 'Tam Kapandı' | 'Kısmi Tahsilat'
  const { entries, customers, modes, openInvoices, isLoadingInvoices, isLoading, isSaving, error, saveCollection, loadOpenInvoices } =
    useCollectionData()
  const [form, setForm] = useState<PaymentEntryForm>({
    party: '',
    referenceInvoice: '',
    paidAmount: 0,
    modeOfPayment: '',
  })
  const selectedInvoice = openInvoices.find((invoice) => invoice.name === form.referenceInvoice)
  const selectedOutstandingAmount = selectedInvoice?.outstanding_amount ?? 0
  const remainingAfterCollection = Math.max(selectedOutstandingAmount - form.paidAmount, 0)
  const collectionStatusLabel =
    form.referenceInvoice && form.paidAmount > 0
      ? remainingAfterCollection === 0
        ? 'Tam Kapandı'
        : 'Kısmi Tahsilat'
      : null
  const normalizedInvoiceSearch = invoiceSearch.trim().toLowerCase()
  const normalizedPartySearch = partySearch.trim().toLowerCase()
  const filteredEntries = entries.filter((entry) => {
    if (closureFilter !== 'Hepsi' && entry.closure_status !== closureFilter) {
      return false
    }
    if (normalizedInvoiceSearch && !(entry.reference_invoice || '').toLowerCase().includes(normalizedInvoiceSearch)) {
      return false
    }
    if (normalizedPartySearch && !(entry.party || '').toLowerCase().includes(normalizedPartySearch)) {
      return false
    }
    return true
  })
  const hasPendingEntryApproval = entries.some((entry) => entry.approval_status === 'Pending')

  const onSave = async () => {
    setMessage(null)
    const validationError = validateCollectionForm(form)
    if (validationError) {
      setMessage(validationError)
      return
    }
    if (form.paidAmount > selectedOutstandingAmount) {
      setMessage('Tahsilat tutarı seçilen faturanın kalan borcundan büyük olamaz.')
      return
    }
    const name = await saveCollection(form)
    if (name) {
      setMessage(`Tahsilat kaydı oluşturuldu: ${name}`)
      setForm({ party: '', referenceInvoice: '', paidAmount: 0, modeOfPayment: '' })
      setActiveEntryStep('fatura')
    }
  }
  const selectedCustomerLabel = customers.find((customer) => customer.name === form.party)?.label

  const collectionStats = useMemo(() => {
    const total = filteredEntries.reduce((sum, e) => sum + (e.paid_amount ?? 0), 0)
    const approvedCount = filteredEntries.filter((e) => e.docstatus === 1).length
    const pendingCount = filteredEntries.filter((e) => e.docstatus === 0).length
    const closedCount = filteredEntries.filter((e) => e.closure_status === 'Tam Kapandı').length
    return { total, approvedCount, pendingCount, closedCount }
  }, [filteredEntries])

  return (
    <PageSection title="Tahsilat Girişi" subtitle="Nakit, banka ve kart tahsilat işlemleri">
      <MobileStepFlow
        steps={[
          { key: 'fatura', label: 'Fatura seç' },
          { key: 'odeme', label: 'Ödeme al' },
        ]}
        activeStep={activeEntryStep}
        onStepChange={setActiveEntryStep}
      >
        {activeEntryStep === 'fatura' ? (
          <div className="form-grid quick-form-grid">
            <label>
              Müşteri
              <select
                value={form.party}
                onChange={(event) => {
                  const party = event.target.value
                  setForm((prev) => ({ ...prev, party, referenceInvoice: '' }))
                  void loadOpenInvoices(party)
                }}
              >
                <option value="">Seçiniz</option>
                {customers.map((customer) => (
                  <option key={customer.name} value={customer.name}>
                    {customer.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Açık Fatura
              <select
                value={form.referenceInvoice}
                onChange={(event) => {
                  const referenceInvoice = event.target.value
                  const selected = openInvoices.find((invoice) => invoice.name === referenceInvoice)
                  setForm((prev) => ({
                    ...prev,
                    referenceInvoice,
                    paidAmount: selected?.outstanding_amount ?? prev.paidAmount,
                  }))
                }}
                disabled={!form.party || isLoadingInvoices}
              >
                <option value="">{isLoadingInvoices ? 'Yükleniyor...' : 'Seçiniz'}</option>
                {openInvoices.map((invoice) => (
                  <option key={invoice.name} value={invoice.name}>
                    {invoice.name} - {formatTryCurrency(invoice.outstanding_amount ?? 0)}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => setActiveEntryStep('odeme')} disabled={!form.party || !form.referenceInvoice}>
              Ödeme Adımına Geç
            </button>
          </div>
        ) : (
          <div className="quick-entry-stack">
            <div className="quick-summary-card">
              <span>{selectedCustomerLabel || 'Müşteri seçilmedi'}</span>
              <strong>{form.referenceInvoice || 'Fatura seçilmedi'}</strong>
              <span>Kalan borç: {formatTryCurrency(selectedOutstandingAmount)}</span>
            </div>
            <div className="form-grid quick-form-grid">
              <label>
                Ödeme Yöntemi
                <select
                  value={form.modeOfPayment}
                  onChange={(event) => setForm((prev) => ({ ...prev, modeOfPayment: event.target.value }))}
                >
                  <option value="">Seçiniz</option>
                  {modes.map((mode) => (
                    <option key={mode.name} value={mode.name}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tutar
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.paidAmount}
                  onChange={(event) => setForm((prev) => ({ ...prev, paidAmount: Number(event.target.value) }))}
                />
              </label>
            </div>
            <button type="button" onClick={onSave} disabled={isSaving || hasPendingEntryApproval}>
              {isSaving ? 'Kaydediliyor...' : 'Tahsilat Kaydet'}
            </button>
          </div>
        )}
      </MobileStepFlow>
      {form.referenceInvoice ? (
        <div className="collection-summary-card">
          <p>
            Mevcut Borç: <strong>{formatTryCurrency(selectedOutstandingAmount)}</strong>
          </p>
          <p>
            Tahsilat Tutarı: <strong>{formatTryCurrency(form.paidAmount)}</strong>
          </p>
          <p>
            Tahsilat Sonrası Kalan: <strong>{formatTryCurrency(remainingAfterCollection)}</strong>
          </p>
          {collectionStatusLabel ? (
            <span className={remainingAfterCollection === 0 ? 'status-pill success' : 'status-pill warning'}>
              {collectionStatusLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {message ? <p className="muted">{message}</p> : null}
      {hasPendingEntryApproval ? <p className="error-text">Bekleyen onay oldugu icin yeni tahsilat kaydi kilitlendi.</p> : null}
      {isLoading ? <p className="muted">Tahsilat verisi yükleniyor...</p> : null}
      {!isLoading && form.party && !isLoadingInvoices && openInvoices.length === 0 ? (
        <p className="muted">Seçilen müşteri için açık fatura bulunamadı.</p>
      ) : null}
      {error ? <p className="error-text">{error}</p> : null}
      {form.referenceInvoice && form.paidAmount > selectedOutstandingAmount ? (
        <p className="error-text">Tahsilat tutarı kalan borcu aşıyor.</p>
      ) : null}

      <div className="metric-grid">
        <article className="metric-card">
          <h3>Toplam Tahsilat</h3>
          <strong>{formatTryCurrency(collectionStats.total)}</strong>
        </article>
        <article className="metric-card">
          <h3>Onaylı</h3>
          <strong>{collectionStats.approvedCount}</strong>
        </article>
        <article className="metric-card">
          <h3>Bekleyen</h3>
          <strong>{collectionStats.pendingCount}</strong>
        </article>
        <article className="metric-card">
          <h3>Tam Kapandı</h3>
          <strong>{collectionStats.closedCount}</strong>
        </article>
      </div>

      <div className="form-grid">
        <label>
          Kapanış Durumu
          <select value={closureFilter} onChange={(event) => setClosureFilterRaw(event.target.value)}>
            <option value="Hepsi">Hepsi</option>
            <option value="Tam Kapandı">Tam Kapandı</option>
            <option value="Kısmi Tahsilat">Kısmi Tahsilat</option>
          </select>
        </label>
        <label>
          Fatura No Ara
          <input
            type="text"
            value={invoiceSearch}
            onChange={(event) => setInvoiceSearch(event.target.value)}
            placeholder="SINV-0001"
          />
        </label>
        <label>
          Cari Ara
          <input type="text" value={partySearch} onChange={(event) => setPartySearch(event.target.value)} placeholder="Müşteri" />
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Belge No</th>
              <th>Cari</th>
              <th>Fatura</th>
              <th>Tutar</th>
              <th>Ödeme Yöntemi</th>
              <th>Durum</th>
              <th>Onay Durumu</th>
              <th>Kapanış Durumu</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => (
              <tr key={entry.name}>
                <td>{entry.name}</td>
                <td>{entry.party || '-'}</td>
                <td>{entry.reference_invoice || '-'}</td>
                <td>{formatTryCurrency(entry.paid_amount ?? 0)}</td>
                <td>{entry.mode_of_payment || '-'}</td>
                <td>{entry.docstatus === 1 ? 'Onaylı' : 'Taslak'}</td>
                <td>{formatApprovalStatusLabel(entry.approval_status)}</td>
                <td>{entry.closure_status || '-'}</td>
              </tr>
            ))}
            {!isLoading && filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={8} className="muted">
                  Filtreye uygun tahsilat kaydı bulunamadı.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
