import type { FeatureSettings } from '../../../config/featureFlags'
import { useState } from 'react'
import { formatTryCurrency } from '../../../shared/utils/format'
import { PageSection } from '../../../shared/ui/PageSection'
import { useSalesInvoiceData } from '../hooks/useSalesInvoiceData'
import type { SalesInvoiceForm } from '../types'

type SalesInvoiceScreenProps = {
  settings: FeatureSettings
}

export function SalesInvoiceScreen({ settings }: SalesInvoiceScreenProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { invoices, customers, items, isLoading, isSaving, error, saveInvoice } = useSalesInvoiceData()

  const [form, setForm] = useState<SalesInvoiceForm>({
    customer: '',
    itemCode: '',
    qty: 1,
    rate: 0,
  })

  const onCreate = async () => {
    setMessage(null)
    if (!form.customer || !form.itemCode || form.qty <= 0 || form.rate <= 0) {
      setMessage('Lutfen musteri, urun, miktar ve fiyat alanlarini doldurun.')
      return
    }
    const name = await saveInvoice(form)
    if (name) {
      setMessage(`Fatura olusturuldu: ${name}`)
      setForm({ customer: '', itemCode: '', qty: 1, rate: 0 })
      setIsCreateOpen(false)
    }
  }

  return (
    <PageSection title="Satis Faturalari" subtitle="Taslak ve kesilen faturalar">
      <div className="toolbar">
        <button type="button" onClick={() => setIsCreateOpen((value) => !value)}>
          {isCreateOpen ? 'Formu Kapat' : 'Yeni Fatura'}
        </button>
        {settings['sales_invoice.show_discount_button'] ? (
          <button type="button" className="ghost">
            Iskonto Uygula
          </button>
        ) : null}
      </div>
      {isCreateOpen ? (
        <div className="form-grid">
          <label>
            Musteri
            <select value={form.customer} onChange={(event) => setForm((prev) => ({ ...prev, customer: event.target.value }))}>
              <option value="">Seciniz</option>
              {customers.map((customer) => (
                <option key={customer.name} value={customer.name}>
                  {customer.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Urun
            <select value={form.itemCode} onChange={(event) => setForm((prev) => ({ ...prev, itemCode: event.target.value }))}>
              <option value="">Seciniz</option>
              {items.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Miktar
            <input
              type="number"
              min={1}
              value={form.qty}
              onChange={(event) => setForm((prev) => ({ ...prev, qty: Number(event.target.value) }))}
            />
          </label>
          <label>
            Birim Fiyat
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.rate}
              onChange={(event) => setForm((prev) => ({ ...prev, rate: Number(event.target.value) }))}
            />
          </label>
          <button type="button" onClick={onCreate} disabled={isSaving}>
            {isSaving ? 'Kaydediliyor...' : 'Faturayi Kaydet'}
          </button>
        </div>
      ) : null}
      {message ? <p className="muted">{message}</p> : null}
      {isLoading ? <p className="muted">Satis faturasi verisi yukleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Belge No</th>
              <th>Cari</th>
              <th>Tutar</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.name}>
                <td>{invoice.name}</td>
                <td>{invoice.customer_name || invoice.customer}</td>
                <td>{formatTryCurrency(invoice.grand_total ?? 0)}</td>
                <td>{invoice.docstatus === 1 ? 'Kesildi' : 'Taslak'}</td>
              </tr>
            ))}
            {!isLoading && invoices.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">
                  Gosterilecek satis faturasi bulunamadi.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
