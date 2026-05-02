import type { FeatureSettings } from '../../../config/featureFlags'
import { PageSection } from '../../../shared/ui/PageSection'

type CariListScreenProps = {
  settings: FeatureSettings
}

export function CariListScreen({ settings }: CariListScreenProps) {
  return (
    <PageSection title="Cari Listesi" subtitle="Musteri ve tedarikci bakiyeleri">
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
            <tr>
              <td>Atlas Yapi A.S.</td>
              <td>Musteri</td>
              {settings['customer.show_balance_panel'] ? <td>32.700 TL</td> : null}
              <td>Aktif</td>
            </tr>
            <tr>
              <td>Marmara Tedarik Ltd.</td>
              <td>Tedarikci</td>
              {settings['customer.show_balance_panel'] ? <td>-14.200 TL</td> : null}
              <td>Aktif</td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
