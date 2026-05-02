import type { RoutePageProps } from '../../app/pageProps'
import { PageSection } from '../../shared/ui/PageSection'

export function CollectionEntryPage(props: RoutePageProps) {
  void props
  return (
    <PageSection title="Tahsilat Girisi" subtitle="Nakit, banka ve kart tahsilat islemleri">
      <div className="toolbar">
        <button type="button">Yeni Tahsilat</button>
      </div>
      <p className="muted">Bu ekran Faz 2'de ERPNext Payment Entry ile canli veriye baglanacaktir.</p>
    </PageSection>
  )
}
