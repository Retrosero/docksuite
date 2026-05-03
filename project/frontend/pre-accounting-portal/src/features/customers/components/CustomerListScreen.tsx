import type { FeatureSettings } from '../../../config/featureFlags'
import { useQueryBackedFilter } from '../../../shared/hooks/useQueryBackedFilter'
import { PageSection } from '../../../shared/ui/PageSection'
import { formatTryCurrency } from '../../../shared/utils/format'
import { useCustomerData } from '../hooks/useCustomerData'

type CustomerListScreenProps = {
  settings: FeatureSettings
}

export function CustomerListScreen({ settings }: CustomerListScreenProps) {
  const [search, setSearch] = useQueryBackedFilter({
    queryKey: 'customer_search',
    storageKey: 'customer_filter_search',
    defaultValue: '',
  })
  const { customers, summary, isLoading, error } = useCustomerData()
  const normalizedSearch = search.trim().toLowerCase()
  const filteredCustomers = customers.filter((customer) => {
    const title = `${customer.customer_name || customer.name} ${customer.customer_group || ''} ${customer.territory || ''}`.toLowerCase()
    return !normalizedSearch || title.includes(normalizedSearch)
  })

  return (
    <PageSection title="Müşteriler" subtitle="Müşteri kartları, durum ve bakiye özeti">
      {isLoading ? <p className="muted">Müşteriler yükleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Toplam Müşteri</h3>
          <strong>{summary.totalCustomers}</strong>
        </article>
        <article className="metric-card">
          <h3>Aktif Müşteri</h3>
          <strong>{summary.activeCustomers}</strong>
        </article>
        {settings['customer.show_balance_panel'] ? (
          <article className="metric-card">
            <h3>Açık Bakiye</h3>
            <strong>{formatTryCurrency(summary.openBalance)}</strong>
          </article>
        ) : null}
      </div>
      <div className="form-grid">
        <label>
          Müşteri Ara
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Unvan, grup veya bölge" />
        </label>
      </div>
      <div className="record-list">
        {filteredCustomers.map((customer) => (
          <article className="record-card" key={customer.name}>
            <div>
              <strong>{customer.customer_name || customer.name}</strong>
              <span>{customer.customer_group || 'Grup yok'} · {customer.territory || 'Bölge yok'}</span>
            </div>
            <div>
              {settings['customer.show_balance_panel'] ? <span>{formatTryCurrency(customer.balance)}</span> : null}
              <span className={customer.disabled ? 'status-pill warning' : 'status-pill success'}>
                {customer.disabled ? 'Pasif' : 'Aktif'}
              </span>
            </div>
          </article>
        ))}
        {!isLoading && filteredCustomers.length === 0 ? <p className="muted">Filtreye uygun müşteri bulunamadı.</p> : null}
      </div>
    </PageSection>
  )
}
