import type { FeatureSettings } from '../../../config/featureFlags'
import { formatTryCurrency } from '../../../shared/utils/format'
import { PageSection } from '../../../shared/ui/PageSection'
import { useDashboardSummary } from '../hooks/useDashboardSummary'

type DashboardScreenProps = {
  settings: FeatureSettings
}

export function DashboardScreen({ settings }: DashboardScreenProps) {
  const { summary, isLoading, error } = useDashboardSummary()

  return (
    <PageSection title="Finans Ozeti" subtitle="Gunluk operasyon ve nakit akis gorunumu">
      {isLoading ? <p className="muted">Dashboard verisi yukleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Bugunku Satis</h3>
          <strong>{formatTryCurrency(summary.todaySalesTotal)}</strong>
        </article>
        <article className="metric-card">
          <h3>Bekleyen Tahsilat</h3>
          <strong>{formatTryCurrency(summary.pendingCollectionsTotal)}</strong>
        </article>
        <article className="metric-card">
          <h3>Bekleyen Odeme</h3>
          <strong>{formatTryCurrency(summary.pendingPaymentsTotal)}</strong>
        </article>
        {settings['dashboard.show_overdue_receivables'] ? (
          <article className="metric-card alert">
            <h3>Vadesi Gecen Alacak</h3>
            <strong>{formatTryCurrency(summary.overdueReceivablesTotal)}</strong>
          </article>
        ) : null}
      </div>
    </PageSection>
  )
}
