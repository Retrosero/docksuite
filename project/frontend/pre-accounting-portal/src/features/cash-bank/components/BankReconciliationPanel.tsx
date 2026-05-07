import { formatTryCurrency } from '../../../shared/utils/format'
import { useBankReconciliation } from '../hooks/useBankReconciliation'

export function BankReconciliationPanel() {
  const { matches, confirmedIndexes, recentEvents, isProcessing, isConfirming, error, reconcileStatement, confirmMatch } = useBankReconciliation()

  const highCount = matches.filter((row) => row.confidence === 'high').length
  const mediumCount = matches.filter((row) => row.confidence === 'medium').length
  const lowCount = matches.filter((row) => row.confidence === 'low').length
  const confirmedCount = confirmedIndexes.length

  return (
    <section className="reconciliation-panel" aria-labelledby="reconciliation-title">
      <h3 id="reconciliation-title">Banka Mutabakat Baslangici</h3>
      <p className="muted">CSV ekstre yukleyin, sistem uygun Payment Entry kayitlari icin eslestirme onerisi cikarsin.</p>
      <div className="form-grid">
        <label>
          Ekstre CSV
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              void reconcileStatement(file)
            }}
          />
        </label>
      </div>

      {isProcessing ? <p className="muted">Mutabakat onerileri hazirlaniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {matches.length ? (
        <>
          <div className="settings-overview">
            <div>
              <strong>{matches.length}</strong>
              <span>Islem Satiri</span>
            </div>
            <div>
              <strong>{highCount}</strong>
              <span>Yuksek Eslesme</span>
            </div>
            <div>
              <strong>{mediumCount}</strong>
              <span>Orta Eslesme</span>
            </div>
            <div>
              <strong>{lowCount}</strong>
              <span>Eslesmeyen</span>
            </div>
            <div>
              <strong>{confirmedCount}</strong>
              <span>Onaylanan</span>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Aciklama</th>
                  <th>Tutar</th>
                  <th>Onerilen Kayit</th>
                  <th>Guven</th>
                  <th>Islem</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((row, index) => (
                  <tr key={`${row.statement.date}-${index}`}>
                    <td>{row.statement.date}</td>
                    <td>{row.statement.description}</td>
                    <td>{formatTryCurrency(row.statement.amount)}</td>
                    <td>{row.paymentEntryName ? `${row.paymentEntryName}${row.party ? ` (${row.party})` : ''}` : '-'}</td>
                    <td>{row.confidence === 'high' ? 'Yuksek' : row.confidence === 'medium' ? 'Orta' : 'Dusuk'}</td>
                    <td>
                      {confirmedIndexes.includes(index) ? (
                        <span className="status-pill success">Onaylandi</span>
                      ) : (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => void confirmMatch(index)}
                          disabled={isConfirming || !row.paymentEntryName}
                        >
                          Onayla
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {recentEvents.length ? (
        <div className="record-list compact">
          <h4 className="subsection-title">Son Onaylar</h4>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Zaman</th>
                  <th>Payment Entry</th>
                  <th>Tutar</th>
                  <th>Guven</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event) => (
                  <tr key={event.name}>
                    <td>{event.confirmed_at || '-'}</td>
                    <td>{event.payment_entry_name || '-'}</td>
                    <td>{typeof event.statement_amount === 'number' ? formatTryCurrency(event.statement_amount) : '-'}</td>
                    <td>{event.confidence || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  )
}
