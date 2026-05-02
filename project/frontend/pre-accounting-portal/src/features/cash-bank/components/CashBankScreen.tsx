import { formatTryCurrency } from '../../../shared/utils/format'
import { PageSection } from '../../../shared/ui/PageSection'
import { useCashBankData } from '../hooks/useCashBankData'

export function CashBankScreen() {
  const { rows, totalCash, totalBank, isLoading, error } = useCashBankData()
  return (
    <PageSection title="Kasa ve Banka" subtitle="Nakit ve banka hesap bakiyeleri">
      {isLoading ? <p className="muted">Kasa/Banka verisi yukleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Toplam Kasa</h3>
          <strong>{formatTryCurrency(totalCash)}</strong>
        </article>
        <article className="metric-card">
          <h3>Toplam Banka</h3>
          <strong>{formatTryCurrency(totalBank)}</strong>
        </article>
        <article className="metric-card">
          <h3>Hesap Sayisi</h3>
          <strong>{rows.length}</strong>
        </article>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Hesap</th>
              <th>Tip</th>
              <th>Bakiye</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.account_name || row.name}</td>
                <td>{row.account_type || '-'}</td>
                <td>{formatTryCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
