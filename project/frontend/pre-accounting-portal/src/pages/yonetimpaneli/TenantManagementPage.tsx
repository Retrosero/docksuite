import { useState } from 'react'
import { PageSection } from '../../shared/ui/PageSection'
import {
  fetchTenantList,
  createTenant,
  activateTenant,
  suspendTenant,
  validateSubdomain,
  formatTenantStatus,
  type TenantInfo,
  type TenantFormData,
} from '../../features/tenant/services/tenantService'

export function TenantManagementPage() {
  const [tenants, setTenants] = useState<TenantInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<TenantFormData>({
    company_name: '',
    subdomain: '',
    email: '',
    phone: '',
    tax_id: '',
    address: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

  const loadTenants = async () => {
    setIsLoading(true)
    try {
      const data = await fetchTenantList()
      setTenants(data)
      setError(null)
    } catch {
      setError('Tenant listesi yüklenemedi.')
    } finally {
      setIsLoading(false)
    }
  }

  useState(() => {
    void loadTenants()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const subdomainError = validateSubdomain(formData.subdomain)
    if (subdomainError) {
      setFormError(subdomainError)
      return
    }

    try {
      const result = await createTenant(formData)
      if (result) {
        setShowForm(false)
        setFormData({ company_name: '', subdomain: '', email: '', phone: '', tax_id: '', address: '' })
        void loadTenants()
      }
    } catch {
      setFormError('Tenant oluşturulamadı.')
    }
  }

  const handleActivate = async (subdomain: string) => {
    try {
      await activateTenant(subdomain)
      void loadTenants()
    } catch {
      setError('Tenant aktive edilemedi.')
    }
  }

  const handleSuspend = async (subdomain: string) => {
    try {
      await suspendTenant(subdomain)
      void loadTenants()
    } catch {
      setError('Tenant askıya alınamadı.')
    }
  }

  return (
    <PageSection title="Tenant Yönetimi" subtitle="Multi-tenant SaaS yapılandırması">
      <div className="toolbar-stack">
        <button type="button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'İptal' : '+ Yeni Tenant'}
        </button>
        <button type="button" className="ghost" onClick={() => void loadTenants()}>
          Yenile
        </button>
      </div>

      {showForm && (
        <form className="form-grid" onSubmit={(e) => void handleSubmit(e)}>
          <input
            type="text"
            placeholder="Şirket Adı *"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Subdomain *"
            value={formData.subdomain}
            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
            required
          />
          <input
            type="email"
            placeholder="E-posta *"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Telefon"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Vergi No"
            value={formData.tax_id}
            onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
          />
          <textarea
            placeholder="Adres"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          {formError ? <p className="error-text">{formError}</p> : null}
          <button type="submit">Tenant Oluştur</button>
        </form>
      )}

      {isLoading ? (
        <p className="muted">Tenantlar yükleniyor...</p>
      ) : tenants.length === 0 ? (
        <p className="muted">Tenant bulunmuyor.</p>
      ) : (
        <div className="record-list">
          {tenants.map((tenant) => (
            <article key={tenant.name} className="record-card">
              <div>
                <strong>{tenant.company_name}</strong>
                <span>Subdomain: {tenant.subdomain}</span>
                <span>E-posta: {tenant.email}</span>
                <span>Durum: {formatTenantStatus(tenant.status)}</span>
                {tenant.trial_ends ? <span>Deneme Bitişi: {new Date(tenant.trial_ends).toLocaleDateString('tr-TR')}</span> : null}
              </div>
              <div className="quick-entry-stack">
                {tenant.status === 'Trial' && (
                  <button type="button" onClick={() => void handleActivate(tenant.subdomain)}>
                    Aktive Et
                  </button>
                )}
                {tenant.status === 'Active' && (
                  <button type="button" className="ghost" onClick={() => void handleSuspend(tenant.subdomain)}>
                    Askıya Al
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {error ? <p className="error-text">{error}</p> : null}
    </PageSection>
  )
}
