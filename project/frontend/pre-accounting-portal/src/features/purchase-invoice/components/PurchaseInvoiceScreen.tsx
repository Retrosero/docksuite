import type { FeatureSettings } from '../../../config/featureFlags'
import { useQueryBackedFilter } from '../../../shared/hooks/useQueryBackedFilter'
import { PageSection } from '../../../shared/ui/PageSection'
import { formatTryCurrency } from '../../../shared/utils/format'
import { usePurchaseInvoiceData } from '../hooks/usePurchaseInvoiceData'

type PurchaseInvoiceScreenProps = {
  settings: FeatureSettings
}

export function PurchaseInvoiceScreen({ settings }: PurchaseInvoiceScreenProps) {
  const [statusFilterRaw, setStatusFilterRaw] = useQueryBackedFilter({
    queryKey: 'pi_status',
    storageKey: 'purchase_invoice_filter_status',
    defaultValue: 'Hepsi',
    allowedValues: ['Hepsi', 'Taslak', 'Kesildi', 'Açık'],
  })
  const [supplierSearch, setSupplierSearch] = useQueryBackedFilter({
    queryKey: 'pi_supplier',
    storageKey: 'purchase_invoice_filter_supplier',
    defaultValue: '',
  })
  const statusFilter = statusFilterRaw as 'Hepsi' | 'Taslak' | 'Kesildi' | 'Açık'
  const { invoices, summary, isLoading, error } = usePurchaseInvoiceData()
  const normalizedSupplier = supplierSearch.trim().toLowerCase()
  const filteredInvoices = invoices.filter((invoice) => {
    const status = invoice.docstatus === 1 ? 'Kesildi' : 'Taslak'
    const isOpen = (invoice.outstanding_amount ?? 0) > 0
    if (statusFilter === 'Açık' && !isOpen) return false
    if (statusFilter !== 'Hepsi' && statusFilter !== 'Açık' && statusFilter !== status) return false
    if (normalizedSupplier && !(invoice.supplier_name || invoice.supplier).toLowerCase().includes(normalizedSupplier)) return false
    return true
  })

  return (
    <PageSection title="Alış Faturaları" subtitle="Tedarikçi faturaları ve açık ödeme takibi">
      {isLoading ? <p className="muted">Alış faturaları yükleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Açık Ödeme</h3>
          <strong>{formatTryCurrency(summary.totalOpen)}</strong>
        </article>
        <article className="metric-card">
          <h3>Açık Fatura</h3>
          <strong>{summary.openCount}</strong>
        </article>
        <article className="metric-card">
          <h3>Taslak</h3>
          <strong>{summary.draftCount}</strong>
        </article>
      </div>
      <div className="form-grid">
        <label>
          Durum
          <select value={statusFilter} onChange={(event) => setStatusFilterRaw(event.target.value)}>
            <option value="Hepsi">Hepsi</option>
            <option value="Taslak">Taslak</option>
            <option value="Kesildi">Kesildi</option>
            <option value="Açık">Açık</option>
          </select>
        </label>
        {settings['purchase_invoice.show_supplier_filter'] ? (
          <label>
            Tedarikçi Ara
            <input value={supplierSearch} onChange={(event) => setSupplierSearch(event.target.value)} placeholder="Tedarikçi" />
          </label>
        ) : null}
      </div>
      <div className="record-list">
        {filteredInvoices.map((invoice) => (
          <article className="record-card" key={invoice.name}>
            <div>
              <strong>{invoice.name}</strong>
              <span>{invoice.supplier_name || invoice.supplier}</span>
            </div>
            <div>
              <span>{formatTryCurrency(invoice.grand_total ?? 0)}</span>
              <span className={(invoice.outstanding_amount ?? 0) > 0 ? 'status-pill warning' : 'status-pill success'}>
                {(invoice.outstanding_amount ?? 0) > 0 ? 'Açık' : 'Kapandı'}
              </span>
            </div>
          </article>
        ))}
        {!isLoading && filteredInvoices.length === 0 ? <p className="muted">Filtreye uygun alış faturası bulunamadı.</p> : null}
      </div>
    </PageSection>
  )
}
