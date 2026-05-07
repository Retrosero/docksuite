import { useEffect, useMemo, useState } from 'react'
import { getResourceList } from '../../../services/erpApi'
import { PageSection } from '../../../shared/ui/PageSection'
import { formatTryCurrency } from '../../../shared/utils/format'
import {
  fetchCustomerLedger,
  fetchCustomerNotes,
  fetchCustomerPurchasedProducts,
  fetchCustomerSalesInvoices,
} from '../services/customerService'
import type { CustomerInvoiceSummary, CustomerLedgerMovement, CustomerNote, CustomerPurchasedProduct } from '../types'

type CustomerRow = {
  name: string
  customer_name?: string
  customer_group?: string
  territory?: string
  disabled?: number
  mobile_no?: string
  email_id?: string
}

function getCustomerFromQuery(): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('name') || ''
}

export function CustomerDetailScreen() {
  const [customer, setCustomer] = useState<CustomerRow | null>(null)
  const [invoices, setInvoices] = useState<CustomerInvoiceSummary[]>([])
  const [products, setProducts] = useState<CustomerPurchasedProduct[]>([])
  const [movements, setMovements] = useState<CustomerLedgerMovement[]>([])
  const [notes, setNotes] = useState<CustomerNote[]>([])
  const [balance, setBalance] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const customerName = useMemo(() => getCustomerFromQuery(), [])

  useEffect(() => {
    let active = true
    void (async () => {
      setIsLoading(true)
      setError(null)
      if (!customerName) {
        setError('Musteri secimi bulunamadi.')
        setIsLoading(false)
        return
      }
      try {
        const rows = await getResourceList<CustomerRow>('Customer', {
          fields: ['name', 'customer_name', 'customer_group', 'territory', 'disabled', 'mobile_no', 'email_id'],
          filters: [['name', '=', customerName]],
          limit: 1,
        })
        if (!active) return
        setCustomer(rows[0] || null)

        const invoiceRows = await fetchCustomerSalesInvoices(customerName)
        if (!active) return
        setInvoices(invoiceRows)

        const [productRows, ledgerResult, noteRows] = await Promise.all([
          fetchCustomerPurchasedProducts(invoiceRows.map((row) => row.invoiceName)),
          fetchCustomerLedger(customerName),
          fetchCustomerNotes(customerName),
        ])
        if (!active) return
        setProducts(productRows)
        setMovements(ledgerResult.movements)
        setBalance(ledgerResult.balance)
        setNotes(noteRows)
      } catch {
        if (active) setError('Musteri detay verileri alinamadi.')
      } finally {
        if (active) setIsLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [customerName])

  return (
    <PageSection title="Musteri Detay" subtitle="Musteri bilgileri, satis gecmisi ve cari hareketler">
      <div className="toolbar">
        <button type="button" className="ghost" onClick={() => { window.history.pushState({}, '', '/musteriler'); window.dispatchEvent(new PopStateEvent('popstate')) }}>Listeye Don</button>
      </div>
      {isLoading ? <p className="muted">Detay yukleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!isLoading && customer ? (
        <>
          <div className="metric-grid">
            <article className="metric-card"><h3>Unvan</h3><strong>{customer.customer_name || customer.name}</strong></article>
            <article className="metric-card"><h3>Grup</h3><strong>{customer.customer_group || '-'}</strong></article>
            <article className="metric-card"><h3>Bolge</h3><strong>{customer.territory || '-'}</strong></article>
            <article className="metric-card"><h3>Bakiye</h3><strong>{formatTryCurrency(balance)}</strong></article>
            <article className="metric-card"><h3>E-posta</h3><strong>{customer.email_id || '-'}</strong></article>
            <article className="metric-card"><h3>Telefon</h3><strong>{customer.mobile_no || '-'}</strong></article>
          </div>

          <div className="detail-grid">
            <section className="panel">
              <h3 className="subsection-title">Daha Once Satin Aldigi Urunler</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Urun</th><th>Miktar</th><th>Toplam Tutar</th></tr></thead>
                  <tbody>
                    {products.slice(0, 20).map((row) => <tr key={row.itemCode}><td>{row.itemName}</td><td>{row.totalQty}</td><td>{formatTryCurrency(row.totalAmount)}</td></tr>)}
                    {products.length === 0 ? <tr><td colSpan={3} className="muted">Urun gecmisi bulunamadi.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <h3 className="subsection-title">Cari Hareketler</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Tarih</th><th>Belge</th><th>Borc</th><th>Alacak</th><th>Bakiye</th></tr></thead>
                  <tbody>
                    {movements.map((row, index) => <tr key={`${row.voucherNo || 'row'}-${index}`}><td>{row.postingDate || '-'}</td><td>{row.voucherType || '-'} {row.voucherNo || ''}</td><td>{formatTryCurrency(row.debit)}</td><td>{formatTryCurrency(row.credit)}</td><td>{formatTryCurrency(row.runningBalance)}</td></tr>)}
                    {movements.length === 0 ? <tr><td colSpan={5} className="muted">Cari hareket bulunamadi.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="detail-grid">
            <section className="panel">
              <h3 className="subsection-title">Satis Gecmisi</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Belge No</th><th>Tarih</th><th>Durum</th><th>Tutar</th><th>Kalan</th></tr></thead>
                  <tbody>
                    {invoices.map((row) => <tr key={row.invoiceName}><td>{row.invoiceName}</td><td>{row.postingDate || '-'}</td><td>{row.status}</td><td>{formatTryCurrency(row.grandTotal)}</td><td>{formatTryCurrency(row.outstandingAmount)}</td></tr>)}
                    {invoices.length === 0 ? <tr><td colSpan={5} className="muted">Satis kaydi bulunamadi.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <h3 className="subsection-title">Notlar</h3>
              <div className="record-list">
                {notes.map((note) => (
                  <article className="record-card" key={note.name}>
                    <div><strong>{note.owner || 'Kullanici'}</strong><span>{note.createdAt || '-'}</span></div>
                    <div><span>{note.content || '-'}</span></div>
                  </article>
                ))}
                {notes.length === 0 ? <p className="muted">Musteri notu bulunamadi.</p> : null}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </PageSection>
  )
}
