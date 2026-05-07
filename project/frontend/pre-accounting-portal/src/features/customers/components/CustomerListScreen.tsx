import type { FeatureSettings } from '../../../config/featureFlags'
import { useState } from 'react'
import { useQueryBackedFilter } from '../../../shared/hooks/useQueryBackedFilter'
import { PageSection } from '../../../shared/ui/PageSection'
import { formatTryCurrency } from '../../../shared/utils/format'
import { validateCustomerForm } from '../../../shared/utils/formValidation'
import { useCustomerData } from '../hooks/useCustomerData'
import type { CustomerForm } from '../types'

type CustomerListScreenProps = {
  settings: FeatureSettings
}

export function CustomerListScreen({ settings }: CustomerListScreenProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState<CustomerForm>({
    customerName: '',
    customerType: 'Company',
    customerGroup: '',
    territory: '',
  })
  const [search, setSearch] = useQueryBackedFilter({
    queryKey: 'customer_search',
    storageKey: 'customer_filter_search',
    defaultValue: '',
  })
  const { customers, customerGroups, territories, summary, isLoading, isSaving, error, saveCustomer } = useCustomerData()
  const normalizedSearch = search.trim().toLowerCase()
  const filteredCustomers = customers.filter((customer) => {
    const title = `${customer.customer_name || customer.name} ${customer.customer_group || ''} ${customer.territory || ''}`.toLowerCase()
    return !normalizedSearch || title.includes(normalizedSearch)
  })
  const canCreateCustomer = customerGroups.length > 0 && territories.length > 0

  const onCreate = async () => {
    setMessage(null)
    const validationError = validateCustomerForm(form)
    if (validationError) {
      setMessage(validationError)
      return
    }
    const name = await saveCustomer(form)
    if (name) {
      setMessage(`Müşteri kartı oluşturuldu: ${name}`)
      setForm({ customerName: '', customerType: 'Company', customerGroup: '', territory: '' })
      setIsCreateOpen(false)
    }
  }

  const openDetail = (customerName: string) => {
    const path = `/musteri-detay?name=${encodeURIComponent(customerName)}`
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <PageSection title="Müşteriler" subtitle="Müşteri kartları, durum ve bakiye özeti">
      {settings['customer.allow_quick_create'] ? (
        <div className="toolbar">
          <button type="button" onClick={() => setIsCreateOpen((value) => !value)}>
            {isCreateOpen ? 'Formu Kapat' : 'Yeni Müşteri'}
          </button>
        </div>
      ) : null}
      {settings['customer.allow_quick_create'] && isCreateOpen ? (
        <div className="quick-entry-stack card-create-panel">
          {!canCreateCustomer ? (
          <p className="notice">Müşteri grubu ve bölge listeleri yüklenmeden müşteri kartı oluşturulamaz. Ayarlar {' > '} Zorunlu Master Veri Yönetimi bölümünden tamamlayın.</p>
          ) : null}
          <div className="form-grid quick-form-grid">
            <label>
              Müşteri Adı
              <input
                value={form.customerName}
                onChange={(event) => setForm((prev) => ({ ...prev, customerName: event.target.value }))}
                placeholder="Ticari unvan veya kişi adı"
              />
            </label>
            <label>
              Müşteri Tipi
              <select
                value={form.customerType}
                onChange={(event) => setForm((prev) => ({ ...prev, customerType: event.target.value as CustomerForm['customerType'] }))}
              >
                <option value="Company">Firma</option>
                <option value="Individual">Kişi</option>
              </select>
            </label>
            <label>
              Müşteri Grubu
              <select
                value={form.customerGroup}
                onChange={(event) => setForm((prev) => ({ ...prev, customerGroup: event.target.value }))}
              >
                <option value="">Seçiniz</option>
                {customerGroups.map((group) => (
                  <option key={group.name} value={group.name}>
                    {group.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Bölge
              <select value={form.territory} onChange={(event) => setForm((prev) => ({ ...prev, territory: event.target.value }))}>
                <option value="">Seçiniz</option>
                {territories.map((territory) => (
                  <option key={territory.name} value={territory.name}>
                    {territory.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="button" onClick={onCreate} disabled={isSaving || !canCreateCustomer}>
            {isSaving ? 'Kaydediliyor...' : 'Müşteri Kartını Kaydet'}
          </button>
        </div>
      ) : null}
      {message ? <p className="muted">{message}</p> : null}
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
              <button type="button" className="ghost" onClick={() => openDetail(customer.name)}>
                Detay
              </button>
            </div>
          </article>
        ))}
        {!isLoading && filteredCustomers.length === 0 ? <p className="muted">Filtreye uygun müşteri bulunamadı.</p> : null}
      </div>
    </PageSection>
  )
}
