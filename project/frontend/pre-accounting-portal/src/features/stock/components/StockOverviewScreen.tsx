import type { FeatureSettings } from '../../../config/featureFlags'
import { PageSection } from '../../../shared/ui/PageSection'
import { useStockData } from '../hooks/useStockData'

type StockOverviewScreenProps = {
  settings: FeatureSettings
}

export function StockOverviewScreen({ settings }: StockOverviewScreenProps) {
  const { summary, rows, isLoading, error } = useStockData()
  return (
    <PageSection title="Stok Ozeti" subtitle="Kritik urunler ve depo gorunumu">
      {settings['stock.show_low_stock_alert'] ? (
        <div className="notice">Kritik stok uyarisi: {summary.lowStockCount} urun minimum seviyenin altinda.</div>
      ) : null}
      {isLoading ? <p className="muted">Stok verisi yukleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Toplam Urun</h3>
          <strong>{summary.totalItems}</strong>
        </article>
        <article className="metric-card">
          <h3>Aktif Depo</h3>
          <strong>{summary.activeWarehouses}</strong>
        </article>
        <article className="metric-card">
          <h3>Kritik Urun</h3>
          <strong>{summary.lowStockCount}</strong>
        </article>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Urun Kodu</th>
              <th>Urun Adi</th>
              <th>Grup</th>
              <th>Toplam Stok</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.item_name || '-'}</td>
                <td>{row.item_group || '-'}</td>
                <td>{row.totalQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
