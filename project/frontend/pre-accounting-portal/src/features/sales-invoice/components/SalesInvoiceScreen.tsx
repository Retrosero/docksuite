import type { FeatureSettings } from '../../../config/featureFlags'
import { PageSection } from '../../../shared/ui/PageSection'

type SalesInvoiceScreenProps = {
  settings: FeatureSettings
}

export function SalesInvoiceScreen({ settings }: SalesInvoiceScreenProps) {
  return (
    <PageSection title="Satis Faturalari" subtitle="Taslak ve kesilen faturalar">
      <div className="toolbar">
        <button type="button">Yeni Fatura</button>
        {settings['sales_invoice.show_discount_button'] ? (
          <button type="button" className="ghost">
            Iskonto Uygula
          </button>
        ) : null}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Belge No</th>
              <th>Cari</th>
              <th>Tutar</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SINV-0001</td>
              <td>Atlas Yapi A.S.</td>
              <td>18.500 TL</td>
              <td>Taslak</td>
            </tr>
            <tr>
              <td>SINV-0002</td>
              <td>Nova Enerji Ltd.</td>
              <td>46.900 TL</td>
              <td>Kesildi</td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
