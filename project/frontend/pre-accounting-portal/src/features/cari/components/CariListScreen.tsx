import type { FeatureSettings } from '../../../config/featureFlags'
import { formatTryCurrency } from '../../../shared/utils/format'
import { PageSection } from '../../../shared/ui/PageSection'
import { useCariList } from '../hooks/useCariList'

type CariListScreenProps = {
  settings: FeatureSettings
}

export function CariListScreen({ settings }: CariListScreenProps) {
  const { items, isLoading, error } = useCariList()

  return (
    <PageSection title="Cari Listesi" subtitle="Musteri ve tedarikci bakiyeleri">
      {isLoading ? <p className="muted">Cari verisi yukleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Unvan</th>
              <th>Tip</th>
              {settings['customer.show_balance_panel'] ? <th>Bakiye</th> : null}
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.type}</td>
                {settings['customer.show_balance_panel'] ? <td>{formatTryCurrency(item.balance)}</td> : null}
                <td>{item.status}</td>
              </tr>
            ))}
            {!isLoading && items.length === 0 ? (
              <tr>
                <td colSpan={settings['customer.show_balance_panel'] ? 4 : 3} className="muted">
                  Gosterilecek cari kaydi bulunamadi.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
