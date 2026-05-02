import type { FeatureSettings } from '../../../config/featureFlags'
import { PageSection } from '../../../shared/ui/PageSection'

type StockOverviewScreenProps = {
  settings: FeatureSettings
}

export function StockOverviewScreen({ settings }: StockOverviewScreenProps) {
  return (
    <PageSection title="Stok Ozeti" subtitle="Kritik urunler ve depo gorunumu">
      {settings['stock.show_low_stock_alert'] ? (
        <div className="notice">Kritik stok uyarisi: 3 urun minimum seviyenin altinda.</div>
      ) : null}
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Toplam Urun</h3>
          <strong>248</strong>
        </article>
        <article className="metric-card">
          <h3>Aktif Depo</h3>
          <strong>4</strong>
        </article>
        <article className="metric-card">
          <h3>Hizli Talep</h3>
          <strong>12</strong>
        </article>
      </div>
    </PageSection>
  )
}
