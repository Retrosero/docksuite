import { useState } from 'react'
import { formatTryCurrency } from '../../../shared/utils/format'
import { PageSection } from '../../../shared/ui/PageSection'
import { useCollectionData } from '../hooks/useCollectionData'
import type { PaymentEntryForm } from '../types'

export function CollectionScreen() {
  const [message, setMessage] = useState<string | null>(null)
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

  const onSave = async () => {
    setMessage(null)
    if (!form.party || form.paidAmount <= 0 || !form.modeOfPayment || !form.referenceInvoice) {
      setMessage('Lutfen musteri, acik fatura, odeme yontemi ve tahsilat tutarini girin.')
      return
    }
    if (form.paidAmount > selectedOutstandingAmount) {
      setMessage('Tahsilat tutari secilen faturanin kalan borcundan buyuk olamaz.')
      return
    }
    const name = await saveCollection(form)
    if (name) {
      setMessage(`Tahsilat kaydi olusturuldu: ${name}`)
      setForm({ party: '', referenceInvoice: '', paidAmount: 0, modeOfPayment: '' })
    }
  }

  return (
    <PageSection title="Tahsilat Girisi" subtitle="Nakit, banka ve kart tahsilat islemleri">
      <div className="form-grid">
        <label>
          Musteri
          <select
            value={form.party}
            onChange={(event) => {
              const party = event.target.value
              setForm((prev) => ({ ...prev, party, referenceInvoice: '' }))
              void loadOpenInvoices(party)
            }}
          >
            <option value="">Seciniz</option>
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
            <option value="">{isLoadingInvoices ? 'Yukleniyor...' : 'Seciniz'}</option>
            {openInvoices.map((invoice) => (
              <option key={invoice.name} value={invoice.name}>
                {invoice.name} - {formatTryCurrency(invoice.outstanding_amount ?? 0)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Odeme Yontemi
          <select
            value={form.modeOfPayment}
            onChange={(event) => setForm((prev) => ({ ...prev, modeOfPayment: event.target.value }))}
          >
            <option value="">Seciniz</option>
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
          <p className="muted">Kalan Borc: {formatTryCurrency(selectedOutstandingAmount)}</p>
        ) : null}
        <button type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Kaydediliyor...' : 'Tahsilat Kaydet'}
        </button>
      </div>
      {form.referenceInvoice ? (
        <div className="collection-summary-card">
          <p>
            Mevcut Borc: <strong>{formatTryCurrency(selectedOutstandingAmount)}</strong>
          </p>
          <p>
            Tahsilat Tutari: <strong>{formatTryCurrency(form.paidAmount)}</strong>
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
      {isLoading ? <p className="muted">Tahsilat verisi yukleniyor...</p> : null}
      {!isLoading && form.party && !isLoadingInvoices && openInvoices.length === 0 ? (
        <p className="muted">Secilen musteri icin acik fatura bulunamadi.</p>
      ) : null}
      {error ? <p className="error-text">{error}</p> : null}
      {form.referenceInvoice && form.paidAmount > selectedOutstandingAmount ? (
        <p className="error-text">Tahsilat tutari kalan borcu asiyor.</p>
      ) : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Belge No</th>
              <th>Cari</th>
              <th>Tutar</th>
              <th>Odeme Yontemi</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.name}>
                <td>{entry.name}</td>
                <td>{entry.party || '-'}</td>
                <td>{formatTryCurrency(entry.paid_amount ?? 0)}</td>
                <td>{entry.mode_of_payment || '-'}</td>
                <td>{entry.docstatus === 1 ? 'Onayli' : 'Taslak'}</td>
              </tr>
            ))}
            {!isLoading && entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  Gosterilecek tahsilat kaydi bulunamadi.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
