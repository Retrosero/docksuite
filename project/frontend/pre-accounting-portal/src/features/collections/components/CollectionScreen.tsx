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

  const onSave = async () => {
    setMessage(null)
    if (!form.party || form.paidAmount <= 0 || !form.modeOfPayment || !form.referenceInvoice) {
      setMessage('Lutfen musteri, acik fatura, odeme yontemi ve tahsilat tutarini girin.')
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
            onChange={(event) => setForm((prev) => ({ ...prev, referenceInvoice: event.target.value }))}
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
        <button type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Kaydediliyor...' : 'Tahsilat Kaydet'}
        </button>
      </div>

      {message ? <p className="muted">{message}</p> : null}
      {isLoading ? <p className="muted">Tahsilat verisi yukleniyor...</p> : null}
      {!isLoading && form.party && !isLoadingInvoices && openInvoices.length === 0 ? (
        <p className="muted">Secilen musteri icin acik fatura bulunamadi.</p>
      ) : null}
      {error ? <p className="error-text">{error}</p> : null}

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
