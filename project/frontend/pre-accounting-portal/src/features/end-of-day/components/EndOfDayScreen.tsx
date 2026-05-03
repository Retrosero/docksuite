import type { FeatureSettings } from '../../../config/featureFlags'
import { PageSection } from '../../../shared/ui/PageSection'
import { formatTryCurrency } from '../../../shared/utils/format'
import { useEndOfDayData } from '../hooks/useEndOfDayData'

type EndOfDayScreenProps = {
  settings: FeatureSettings
}

export function EndOfDayScreen({ settings }: EndOfDayScreenProps) {
  const { summary, activities, isLoading, error } = useEndOfDayData()

  return (
    <PageSection title="Gün Sonu" subtitle="Günlük satış, tahsilat, alış ve ödeme kapanış özeti">
      {isLoading ? <p className="muted">Gün sonu özeti yükleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Bugünkü Satış</h3>
          <strong>{formatTryCurrency(summary.salesTotal)}</strong>
        </article>
        <article className="metric-card">
          <h3>Bugünkü Tahsilat</h3>
          <strong>{formatTryCurrency(summary.collectionTotal)}</strong>
        </article>
        <article className="metric-card">
          <h3>Bugünkü Alış</h3>
          <strong>{formatTryCurrency(summary.purchaseTotal)}</strong>
        </article>
        <article className="metric-card">
          <h3>Net Nakit Hareketi</h3>
          <strong>{formatTryCurrency(summary.netCashMovement)}</strong>
        </article>
      </div>
      {settings['end_of_day.show_cash_difference'] ? (
        <div className="notice">
          Açık alacak: {formatTryCurrency(summary.openReceivableTotal)} · Açık ödeme: {formatTryCurrency(summary.openPayableTotal)}
        </div>
      ) : null}
      <div className="record-list compact">
        {activities.map((activity) => (
          <article className="record-card" key={activity.label}>
            <div>
              <strong>{activity.label}</strong>
              <span>{activity.count} işlem</span>
            </div>
            <div>
              <span>{formatTryCurrency(activity.amount)}</span>
            </div>
          </article>
        ))}
      </div>
    </PageSection>
  )
}
