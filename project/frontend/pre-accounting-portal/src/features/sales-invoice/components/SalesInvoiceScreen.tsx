import type { FeatureSettings } from '../../../config/featureFlags'
import { useEffect, useState } from 'react'
import { formatTryCurrency } from '../../../shared/utils/format'
import { PageSection } from '../../../shared/ui/PageSection'
import { useSalesInvoiceData } from '../hooks/useSalesInvoiceData'
import type { SalesInvoiceForm } from '../types'

type SalesInvoiceScreenProps = {
  settings: FeatureSettings
}

export function SalesInvoiceScreen({ settings }: SalesInvoiceScreenProps) {
  const params = new URLSearchParams(window.location.search)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'Hepsi' | 'Taslak' | 'Kesildi'>(() => {
    const value = params.get('si_status') || window.localStorage.getItem('sales_invoice_filter_status')
    if (value === 'Taslak' || value === 'Kesildi' || value === 'Hepsi') return value
    return 'Hepsi'
  })
  const [customerSearch, setCustomerSearch] = useState(
    () => params.get('si_customer') || window.localStorage.getItem('sales_invoice_filter_customer') || '',
  )
  const [invoiceSearch, setInvoiceSearch] = useState(
    () => params.get('si_invoice') || window.localStorage.getItem('sales_invoice_filter_invoice') || '',
  )
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
  const normalizedCustomerSearch = customerSearch.trim().toLowerCase()
  const normalizedInvoiceSearch = invoiceSearch.trim().toLowerCase()
  const filteredInvoices = invoices.filter((invoice) => {
    const status = invoice.docstatus === 1 ? 'Kesildi' : 'Taslak'
    if (statusFilter !== 'Hepsi' && statusFilter !== status) return false
    if (normalizedCustomerSearch && !(invoice.customer_name || invoice.customer).toLowerCase().includes(normalizedCustomerSearch)) {
      return false
    }
    if (normalizedInvoiceSearch && !invoice.name.toLowerCase().includes(normalizedInvoiceSearch)) return false
    return true
  })

  useEffect(() => {
    window.localStorage.setItem('sales_invoice_filter_status', statusFilter)
    window.localStorage.setItem('sales_invoice_filter_customer', customerSearch)
    window.localStorage.setItem('sales_invoice_filter_invoice', invoiceSearch)
    const nextParams = new URLSearchParams(window.location.search)
    if (statusFilter === 'Hepsi') nextParams.delete('si_status')
    else nextParams.set('si_status', statusFilter)
    if (customerSearch.trim()) nextParams.set('si_customer', customerSearch.trim())
    else nextParams.delete('si_customer')
    if (invoiceSearch.trim()) nextParams.set('si_invoice', invoiceSearch.trim())
    else nextParams.delete('si_invoice')
    const query = nextParams.toString()
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname
    window.history.replaceState({}, '', nextUrl)
  }, [statusFilter, customerSearch, invoiceSearch])

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
      <div className="form-grid">
        <label>
          Durum
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
            <option value="Hepsi">Hepsi</option>
            <option value="Taslak">Taslak</option>
            <option value="Kesildi">Kesildi</option>
          </select>
        </label>
        <label>
          Cari Ara
          <input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Musteri" />
        </label>
        <label>
          Fatura No Ara
          <input value={invoiceSearch} onChange={(event) => setInvoiceSearch(event.target.value)} placeholder="SINV-0001" />
        </label>
      </div>
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
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.name}>
                <td>{invoice.name}</td>
                <td>{invoice.customer_name || invoice.customer}</td>
                <td>{formatTryCurrency(invoice.grand_total ?? 0)}</td>
                <td>{invoice.docstatus === 1 ? 'Kesildi' : 'Taslak'}</td>
              </tr>
            ))}
            {!isLoading && filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">
                  Filtreye uygun satis faturasi bulunamadi.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
