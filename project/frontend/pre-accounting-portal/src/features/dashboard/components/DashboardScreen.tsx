import type { FeatureSettings } from '../../../config/featureFlags'
import { PageSection } from '../../../shared/ui/PageSection'

type DashboardScreenProps = {
  settings: FeatureSettings
}

export function DashboardScreen({ settings }: DashboardScreenProps) {
  return (
    <PageSection title="Finans Ozeti" subtitle="Gunluk operasyon ve nakit akis gorunumu">
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Bugunku Satis</h3>
          <strong>124.500 TL</strong>
        </article>
        <article className="metric-card">
          <h3>Bekleyen Tahsilat</h3>
          <strong>86.200 TL</strong>
        </article>
        <article className="metric-card">
          <h3>Bekleyen Odeme</h3>
          <strong>48.900 TL</strong>
        </article>
        {settings['dashboard.show_overdue_receivables'] ? (
          <article className="metric-card alert">
            <h3>Vadesi Gecen Alacak</h3>
            <strong>17.300 TL</strong>
          </article>
        ) : null}
      </div>
    </PageSection>
  )
}
