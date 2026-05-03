import type { FeatureSettings } from '../../../config/featureFlags'
import { PageSection } from '../../../shared/ui/PageSection'
import { useStockData } from '../hooks/useStockData'

type StockOverviewScreenProps = {
  settings: FeatureSettings
}

export function StockOverviewScreen({ settings }: StockOverviewScreenProps) {
  const { summary, rows, isLoading, error } = useStockData()
  return (
    <PageSection title="Stok Özeti" subtitle="Kritik ürünler ve depo görünümü">
      {settings['stock.show_low_stock_alert'] ? (
        <div className="notice">Kritik stok uyarısı: {summary.lowStockCount} ürün minimum seviyenin altında.</div>
      ) : null}
      {isLoading ? <p className="muted">Stok verisi yükleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Toplam Ürün</h3>
          <strong>{summary.totalItems}</strong>
        </article>
        <article className="metric-card">
          <h3>Aktif Depo</h3>
          <strong>{summary.activeWarehouses}</strong>
        </article>
        <article className="metric-card">
          <h3>Kritik Ürün</h3>
          <strong>{summary.lowStockCount}</strong>
        </article>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ürün Kodu</th>
              <th>Ürün Adı</th>
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
