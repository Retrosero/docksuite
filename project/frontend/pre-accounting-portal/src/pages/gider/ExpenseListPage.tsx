import type { RoutePageProps } from '../../app/pageProps'
import { PageSection } from '../../shared/ui/PageSection'

export function ExpenseListPage(props: RoutePageProps) {
  void props
  return (
    <PageSection title="Gider ve Odeme" subtitle="Alis faturasi ve odeme kayitlari">
      <div className="toolbar">
        <button type="button">Yeni Alis Faturasi</button>
        <button type="button" className="ghost">
          Tedarikci Odemesi
        </button>
      </div>
      <p className="muted">Bu ekran Faz 3'te Purchase Invoice ve Payment Entry ile tamamlanacaktir.</p>
    </PageSection>
  )
}
