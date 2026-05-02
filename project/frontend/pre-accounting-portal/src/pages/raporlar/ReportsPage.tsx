import type { RoutePageProps } from '../../app/pageProps'
import { PageSection } from '../../shared/ui/PageSection'

export function ReportsPage(props: RoutePageProps) {
  void props
  return (
    <PageSection title="Raporlar" subtitle="Satis, tahsilat ve cari ozet raporlari">
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Aylik Satis Ozeti</h3>
          <strong>Hazirlanacak</strong>
        </article>
        <article className="metric-card">
          <h3>Tahsilat Listesi</h3>
          <strong>Hazirlanacak</strong>
        </article>
        <article className="metric-card">
          <h3>Cari Bakiye Raporu</h3>
          <strong>Hazirlanacak</strong>
        </article>
      </div>
    </PageSection>
  )
}
