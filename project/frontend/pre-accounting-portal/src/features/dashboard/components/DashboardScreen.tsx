import type { RoleTemplateKey } from '../../../app/routes'
import type { FeatureSettings } from '../../../config/featureFlags'
import { formatTryCurrency } from '../../../shared/utils/format'
import { PageSection } from '../../../shared/ui/PageSection'
import { useDashboardSummary } from '../hooks/useDashboardSummary'

type DashboardScreenProps = {
  settings: FeatureSettings
  userRoleTemplate: RoleTemplateKey | null
}

export function DashboardScreen({ settings, userRoleTemplate }: DashboardScreenProps) {
  const { summary, isLoading, error } = useDashboardSummary()
  const showReceivables = userRoleTemplate !== 'depo_sorumlusu'
  const showPayments = userRoleTemplate !== 'satis_operasyon'
  const showDraftInvoices = userRoleTemplate === 'yonetici' || userRoleTemplate === 'muhasebe_sorumlusu'
  const showOverdueReceivables = settings['dashboard.show_overdue_receivables'] && showReceivables

  return (
    <PageSection title="Finans Ozeti" subtitle="Gunluk operasyon ve nakit akis gorunumu">
      {isLoading ? <p className="muted">Genel bakis verisi yukleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="metric-grid">
        <article className="metric-card">
          <h3>Bugunku Satis</h3>
          <strong>{formatTryCurrency(summary.todaySalesTotal)}</strong>
        </article>
        <article className="metric-card">
          <h3>Bugunku Tahsilat</h3>
          <strong>{formatTryCurrency(summary.todayCollectionTotal)}</strong>
        </article>
        {showReceivables ? (
          <article className="metric-card">
            <h3>Bekleyen Tahsilat</h3>
            <strong>{formatTryCurrency(summary.pendingCollectionsTotal)}</strong>
          </article>
        ) : null}
        {showPayments ? (
          <article className="metric-card">
            <h3>Bekleyen Odeme</h3>
            <strong>{formatTryCurrency(summary.pendingPaymentsTotal)}</strong>
          </article>
        ) : null}
        {showOverdueReceivables ? (
          <article className="metric-card alert">
            <h3>Vadesi Gecen Alacak</h3>
            <strong>{formatTryCurrency(summary.overdueReceivablesTotal)}</strong>
          </article>
        ) : null}
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <h3>Bu Ay Tahsilat</h3>
          <strong>{formatTryCurrency(summary.monthCollectionTotal)}</strong>
        </article>
        {showReceivables ? (
          <article className="metric-card">
            <h3>Acik Fatura</h3>
            <strong>{summary.openInvoiceCount}</strong>
          </article>
        ) : null}
        {showDraftInvoices ? (
          <article className="metric-card">
            <h3>Taslak Fatura</h3>
            <strong>{summary.draftInvoiceCount}</strong>
          </article>
        ) : null}
      </div>
    </PageSection>
  )
}
