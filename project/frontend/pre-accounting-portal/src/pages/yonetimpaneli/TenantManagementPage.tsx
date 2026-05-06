import { useEffect, useMemo, useState } from 'react'
import { PageSection } from '../../shared/ui/PageSection'
import {
  activateTenant,
  createTenant,
  fetchTenantList,
  suspendTenant,
  type TenantInfo,
  validateSubdomain,
} from '../../features/tenant/services/tenantService'
import {
  checkUsageLimits,
  formatHealthStatus,
  getDiagnosticLogs,
  getSubscriptionInfo,
  runHealthCheck,
  updateSubscriptionPlan,
  type DiagnosticLogsResult,
  type HealthCheckResult,
  type PlanType,
  type SubscriptionInfo,
  type UsageLimitsResult,
} from '../../features/saas/services/saasOpsService'

export function TenantManagementPage() {
  const [tenants, setTenants] = useState<TenantInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null)
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [usageLimits, setUsageLimits] = useState<UsageLimitsResult | null>(null)
  const [diagnostics, setDiagnostics] = useState<DiagnosticLogsResult | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [showNewTenant, setShowNewTenant] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isPlanUpdating, setIsPlanUpdating] = useState(false)
  const [newPlan, setNewPlan] = useState<PlanType>('Starter')
  const [newTenantData, setNewTenantData] = useState({
    company_name: '',
    subdomain: '',
    email: '',
    plan: 'Starter' as PlanType,
  })

  const selectedTenantRow = useMemo(
    () => tenants.find((tenant) => tenant.subdomain === selectedTenant) ?? null,
    [tenants, selectedTenant],
  )

  const loadTenants = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchTenantList()
      setTenants(data)
      if (!selectedTenant && data.length) setSelectedTenant(data[0].subdomain)
    } catch {
      setError('Tenant listesi yuklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTenants()
  }, [])

  const loadTenantOpsDetails = async (tenantSubdomain: string) => {
    setIsDetailLoading(true)
    try {
      const [health, usage, logs] = await Promise.all([
        runHealthCheck(tenantSubdomain),
        checkUsageLimits(tenantSubdomain),
        getDiagnosticLogs(tenantSubdomain, 'error', 20),
      ])
      setHealthResult(health)
      setUsageLimits(usage)
      setDiagnostics(logs)
      try {
        const subscription = await getSubscriptionInfo(tenantSubdomain)
        setSubscriptionInfo(subscription)
        setNewPlan(subscription.plan)
      } catch {
        setSubscriptionInfo(null)
      }
    } catch {
      setHealthResult(null)
      setUsageLimits(null)
      setDiagnostics(null)
      setSubscriptionInfo(null)
    } finally {
      setIsDetailLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedTenant) return
    void loadTenantOpsDetails(selectedTenant)
  }, [selectedTenant])

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
      setError('Tenant askiya alinamadi')
    }
  }

  const handleCreateTenant = async () => {
    setError(null)
    const subdomainError = validateSubdomain(newTenantData.subdomain)
    if (subdomainError) {
      setError(subdomainError)
      return
    }
    if (!newTenantData.company_name || !newTenantData.email) {
      setError('Firma adi ve email zorunludur')
      return
    }

    setIsCreating(true)
    try {
      await createTenant({
        company_name: newTenantData.company_name,
        subdomain: newTenantData.subdomain,
        email: newTenantData.email,
      })
      setShowNewTenant(false)
      setNewTenantData({ company_name: '', subdomain: '', email: '', plan: 'Starter' })
      await loadTenants()
    } catch {
      setError('Yeni tenant olusturulamadi')
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdatePlan = async () => {
    if (!selectedTenant) return
    setIsPlanUpdating(true)
    try {
      await updateSubscriptionPlan(selectedTenant, newPlan)
      await loadTenantOpsDetails(selectedTenant)
    } catch {
      setError('Plan guncellenemedi')
    } finally {
      setIsPlanUpdating(false)
    }
  }

  return (
    <PageSection title="Tenant Yonetimi" subtitle="Provisioning, plan-limit yonetimi ve health-check">
      <div className="toolbar">
        <button type="button" onClick={() => void loadTenants()}>Yenile</button>
        <button type="button" onClick={() => setShowNewTenant(true)}>Yeni Tenant</button>
      </div>

      {isLoading ? <p className="muted">Yukleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="tenant-grid">
        {tenants.map((tenant) => (
          <article
            key={tenant.name}
            className={`tenant-card ${selectedTenant === tenant.subdomain ? 'selected' : ''}`}
            onClick={() => setSelectedTenant(tenant.subdomain)}
          >
            <div className="tenant-header">
              <strong>{tenant.company_name}</strong>
              <span className="status-badge">{tenant.status}</span>
            </div>
            <p className="tenant-domain">{tenant.subdomain}</p>
            <div className="tenant-actions">
              {tenant.status === 'Active' ? (
                <button type="button" onClick={() => void handleSuspend(tenant.subdomain)}>Askiya Al</button>
              ) : (
                <button type="button" onClick={() => void handleActivate(tenant.subdomain)}>Aktive Et</button>
              )}
            </div>
          </article>
        ))}
      </div>

      {selectedTenantRow ? (
        <section className="panel">
          <h3>Operasyon Detayi: {selectedTenantRow.company_name}</h3>
          {isDetailLoading ? <p className="muted">Detay yukleniyor...</p> : null}

          {subscriptionInfo ? (
            <div className="metric-grid">
              <article className="metric-card">
                <h3>Abonelik</h3>
                <strong>{subscriptionInfo.plan}</strong>
              </article>
              <article className="metric-card">
                <h3>Kullanici</h3>
                <strong>{subscriptionInfo.usage.users}/{subscriptionInfo.limits.max_users < 0 ? 'S' : subscriptionInfo.limits.max_users}</strong>
              </article>
              <article className="metric-card">
                <h3>Islem</h3>
                <strong>{subscriptionInfo.usage.transactions}/{subscriptionInfo.limits.max_transactions < 0 ? 'S' : subscriptionInfo.limits.max_transactions}</strong>
              </article>
              <article className="metric-card">
                <h3>Depolama</h3>
                <strong>{subscriptionInfo.usage.storage_gb}GB/{subscriptionInfo.limits.max_storage_gb < 0 ? 'S' : subscriptionInfo.limits.max_storage_gb}</strong>
              </article>
            </div>
          ) : (
            <p className="muted">Abonelik kaydi bulunamadi.</p>
          )}

          {subscriptionInfo ? (
            <div className="toolbar">
              <select value={newPlan} onChange={(event) => setNewPlan(event.target.value as PlanType)}>
                <option value="Starter">Starter</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
              <button type="button" onClick={() => void handleUpdatePlan()} disabled={isPlanUpdating}>
                {isPlanUpdating ? 'Guncelleniyor...' : 'Plani Guncelle'}
              </button>
            </div>
          ) : null}

          {usageLimits?.has_subscription ? (
            <p className={usageLimits.within_limits ? 'muted' : 'error-text'}>
              {usageLimits.within_limits ? 'Limitler icinde' : 'Limit asimi var'}
            </p>
          ) : null}

          {healthResult ? (
            <div className="health-check-panel">
              <h3>Health Check</h3>
              <p className={`health-status ${healthResult.overall_status}`}>
                {formatHealthStatus(healthResult.overall_status)} - {healthResult.passed_checks}/{healthResult.total_checks}
              </p>
            </div>
          ) : null}

          {diagnostics ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Seviye</th>
                    <th>Mesaj</th>
                    <th>Zaman</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnostics.logs.map((row) => (
                    <tr key={row.name}>
                      <td>{row.level || '-'}</td>
                      <td>{row.message || '-'}</td>
                      <td>{row.creation || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}

      {showNewTenant ? (
        <dialog open className="modal">
          <article>
            <header>Yeni Tenant Olustur</header>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void handleCreateTenant()
              }}
            >
              <label>
                Firma Adi
                <input
                  type="text"
                  value={newTenantData.company_name}
                  onChange={(event) => setNewTenantData((prev) => ({ ...prev, company_name: event.target.value }))}
                  required
                />
              </label>
              <label>
                Subdomain
                <input
                  type="text"
                  value={newTenantData.subdomain}
                  onChange={(event) => setNewTenantData((prev) => ({ ...prev, subdomain: event.target.value }))}
                  required
                />
              </label>
              <label>
                Admin Email
                <input
                  type="email"
                  value={newTenantData.email}
                  onChange={(event) => setNewTenantData((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </label>
              <footer>
                <button type="button" onClick={() => setShowNewTenant(false)}>Iptal</button>
                <button type="submit" disabled={isCreating}>{isCreating ? 'Olusturuluyor...' : 'Olustur'}</button>
              </footer>
            </form>
          </article>
        </dialog>
      ) : null}
    </PageSection>
  )
}
