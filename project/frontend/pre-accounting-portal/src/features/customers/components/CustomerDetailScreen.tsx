import { useEffect, useMemo, useState } from 'react'
import { getResourceList } from '../../../services/erpApi'
import { PageSection } from '../../../shared/ui/PageSection'
import { formatTryCurrency } from '../../../shared/utils/format'

type CustomerRow = {
  name: string
  customer_name?: string
  customer_group?: string
  territory?: string
  disabled?: number
}

type GlRow = { party?: string; debit?: number; credit?: number }

function getCustomerFromQuery(): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('name') || ''
}

export function CustomerDetailScreen() {
  const [customer, setCustomer] = useState<CustomerRow | null>(null)
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
          fields: ['name', 'customer_name', 'customer_group', 'territory', 'disabled'],
          filters: [['name', '=', customerName]],
          limit: 1,
        })
        const current = rows[0] || null
        if (!active) return
        setCustomer(current)
        const glRows = await getResourceList<GlRow>('GL Entry', {
          fields: ['party', 'debit', 'credit'],
          filters: [['party_type', '=', 'Customer'], ['party', '=', customerName]],
          limit: 2000,
        }).catch(() => [])
        if (!active) return
        const total = glRows.reduce((sum, row) => sum + (row.debit || 0) - (row.credit || 0), 0)
        setBalance(total)
      } catch {
        if (active) setError('Musteri detayi alinamadi.')
      } finally {
        if (active) setIsLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [customerName])

  return (
    <PageSection title="Musteri Detay" subtitle="Secilen musteri kart bilgisi">
      <div className="toolbar">
        <button
          type="button"
          className="ghost"
          onClick={() => {
            window.history.pushState({}, '', '/musteriler')
            window.dispatchEvent(new PopStateEvent('popstate'))
          }}
        >
          Listeye Don
        </button>
      </div>
      {isLoading ? <p className="muted">Detay yukleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!isLoading && customer ? (
        <div className="metric-grid">
          <article className="metric-card">
            <h3>Unvan</h3>
            <strong>{customer.customer_name || customer.name}</strong>
          </article>
          <article className="metric-card">
            <h3>Grup</h3>
            <strong>{customer.customer_group || '-'}</strong>
          </article>
          <article className="metric-card">
            <h3>Bolge</h3>
            <strong>{customer.territory || '-'}</strong>
          </article>
          <article className="metric-card">
            <h3>Bakiye</h3>
            <strong>{formatTryCurrency(balance)}</strong>
          </article>
        </div>
      ) : null}
    </PageSection>
  )
}

