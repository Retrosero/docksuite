import { useState } from 'react'
import { PageSection } from '../../shared/ui/PageSection'
import { fetchTenantList, activateTenant, suspendTenant, type TenantInfo } from '../../features/tenant/services/tenantService'
import {
  runHealthCheck,
  formatHealthStatus,
  type HealthCheckResult,
  type PlanType,
} from '../../features/saas/services/saasOpsService'

export function TenantManagementPage() {
  const [tenants, setTenants] = useState<TenantInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null)
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null)
  const [showNewTenant, setShowNewTenant] = useState(false)
  const [newTenantData, setNewTenantData] = useState({
    company_name: '',
    domain: '',
    admin_email: '',
    plan: 'Starter' as PlanType,
  })

  const loadTenants = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchTenantList()
      setTenants(data)
    } catch {
      setError('Tenant listesi yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivate = async (name: string) => {
    try {
      await activateTenant(name)
      await loadTenants()
    } catch {
      setError('Tenant aktive edilemedi')
    }
  }

  const handleSuspend = async (name: string) => {
    try {
      await suspendTenant(name)
      await loadTenants()
    } catch {
      setError('Tenant askıya alınamadı')
    }
  }

  const runHealthCheckForTenant = async (tenantId: string) => {
    try {
      const result = await runHealthCheck(tenantId)
      setHealthResult(result)
    } catch {
      setHealthResult(null)
    }
  }

  const handleCreateTenant = () => {
    console.log('Yeni tenant oluştur:', newTenantData)
    setShowNewTenant(false)
  }

  return (
    <PageSection title="Tenant Yönetimi" subtitle="Multi-tenant SaaS operasyonları">
      <div className="toolbar">
        <button type="button" onClick={() => void loadTenants()}>Yenile</button>
        <button type="button" onClick={() => setShowNewTenant(true)}>Yeni Tenant</button>
      </div>

      {isLoading ? (
        <p className="muted">Yükleniyor...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : (
        <>
          <div className="tenant-grid">
            {tenants.map((tenant: TenantInfo) => (
              <article
                key={tenant.name}
                className={`tenant-card ${selectedTenant === tenant.name ? 'selected' : ''}`}
                onClick={() => setSelectedTenant(tenant.name)}
              >
                <div className="tenant-header">
                  <strong>{tenant.company_name}</strong>
                  <span className="status-badge">{tenant.status}</span>
                </div>
                <p className="tenant-domain">{tenant.subdomain}</p>
                <div className="tenant-status">
                  <span className={`status-dot ${tenant.status === 'Active' ? 'active' : 'inactive'}`} />
                  {tenant.status}
                </div>
                <div className="tenant-actions">
                  {tenant.status === 'Active' ? (
                    <button onClick={() => void handleSuspend(tenant.subdomain)}>Askıya Al</button>
                  ) : (
                    <button onClick={() => void handleActivate(tenant.subdomain)}>Aktive Et</button>
                  )}
                  <button onClick={() => void runHealthCheckForTenant(tenant.subdomain)}>Health Check</button>
                </div>
              </article>
            ))}
          </div>

          {selectedTenant && healthResult && (
            <div className="health-check-panel">
              <h3>Health Check: {healthResult.tenant_id}</h3>
              <div className={`health-status ${healthResult.overall_status}`}>
                {formatHealthStatus(healthResult.overall_status)}
                <span>{healthResult.passed_checks}/{healthResult.total_checks} kontrol geçti</span>
              </div>
              <div className="check-list">
                {healthResult.checks.map((check, idx) => (
                  <div key={idx} className={`check-item ${check.status}`}>
                    <span className="check-name">{check.check_name}</span>
                    <span className="check-value">
                      {check.response_time_ms ? `${check.response_time_ms}ms` : 
                       check.active_users_24h ? `${check.active_users_24h} kullanıcı` :
                       check.transactions_last_hour ? `${check.transactions_last_hour} işlem` :
                       check.error || 'OK'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showNewTenant && (
        <dialog open className="modal">
          <article>
            <header>Yeni Tenant Oluştur</header>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateTenant(); }}>
              <div className="form-group">
                <label>Firma Adı</label>
                <input
                  type="text"
                  value={newTenantData.company_name}
                  onChange={(e) => setNewTenantData({ ...newTenantData, company_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Domain</label>
                <input
                  type="text"
                  value={newTenantData.domain}
                  onChange={(e) => setNewTenantData({ ...newTenantData, domain: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Admin Email</label>
                <input
                  type="email"
                  value={newTenantData.admin_email}
                  onChange={(e) => setNewTenantData({ ...newTenantData, admin_email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Plan</label>
                <select
                  value={newTenantData.plan}
                  onChange={(e) => setNewTenantData({ ...newTenantData, plan: e.target.value as PlanType })}
                >
                  <option value="Starter">Starter</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <footer>
                <button type="button" onClick={() => setShowNewTenant(false)}>İptal</button>
                <button type="submit">Oluştur</button>
              </footer>
            </form>
          </article>
        </dialog>
      )}
    </PageSection>
  )
}
