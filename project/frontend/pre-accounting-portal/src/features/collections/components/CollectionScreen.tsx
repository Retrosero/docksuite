import { useState } from 'react'
import { useQueryBackedFilter } from '../../../shared/hooks/useQueryBackedFilter'
import { validateCollectionForm } from '../../../shared/utils/formValidation'
import { formatTryCurrency } from '../../../shared/utils/format'
import { PageSection } from '../../../shared/ui/PageSection'
import { useCollectionData } from '../hooks/useCollectionData'
import type { PaymentEntryForm } from '../types'

export function CollectionScreen() {
  const [message, setMessage] = useState<string | null>(null)
  const [closureFilterRaw, setClosureFilterRaw] = useQueryBackedFilter({
    queryKey: 'closure',
    storageKey: 'collection_filter_closure',
    defaultValue: 'Hepsi',
    allowedValues: ['Hepsi', 'Tam Kapandi', 'Kismi Tahsilat'],
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
  const closureFilter = closureFilterRaw as 'Hepsi' | 'Tam Kapandi' | 'Kismi Tahsilat'
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
        ? 'Tam Kapandi'
        : 'Kismi Tahsilat'
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
    }
  }

  return (
    <PageSection title="Tahsilat Girişi" subtitle="Nakit, banka ve kart tahsilat işlemleri">
      <div className="form-grid">
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
          Acik Fatura
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
        {form.referenceInvoice ? (
          <p className="muted">Kalan Borç: {formatTryCurrency(selectedOutstandingAmount)}</p>
        ) : null}
        <button type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Kaydediliyor...' : 'Tahsilat Kaydet'}
        </button>
      </div>
      {form.referenceInvoice ? (
        <div className="collection-summary-card">
          <p>
            Mevcut Borç: <strong>{formatTryCurrency(selectedOutstandingAmount)}</strong>
          </p>
          <p>
            Tahsilat Tutarı: <strong>{formatTryCurrency(form.paidAmount)}</strong>
          </p>
          <p>
            Tahsilat Sonrasi Kalan: <strong>{formatTryCurrency(remainingAfterCollection)}</strong>
          </p>
          {collectionStatusLabel ? (
            <span className={remainingAfterCollection === 0 ? 'status-pill success' : 'status-pill warning'}>
              {collectionStatusLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {message ? <p className="muted">{message}</p> : null}
      {isLoading ? <p className="muted">Tahsilat verisi yükleniyor...</p> : null}
      {!isLoading && form.party && !isLoadingInvoices && openInvoices.length === 0 ? (
        <p className="muted">Seçilen müşteri için açık fatura bulunamadı.</p>
      ) : null}
      {error ? <p className="error-text">{error}</p> : null}
      {form.referenceInvoice && form.paidAmount > selectedOutstandingAmount ? (
        <p className="error-text">Tahsilat tutarı kalan borcu aşıyor.</p>
      ) : null}

      <div className="form-grid">
        <label>
          Kapanis Durumu
          <select value={closureFilter} onChange={(event) => setClosureFilterRaw(event.target.value)}>
            <option value="Hepsi">Hepsi</option>
            <option value="Tam Kapandi">Tam Kapandi</option>
            <option value="Kismi Tahsilat">Kismi Tahsilat</option>
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
              <th>Kapanis Durumu</th>
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
                <td>{entry.closure_status || '-'}</td>
              </tr>
            ))}
            {!isLoading && filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className="muted">
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
