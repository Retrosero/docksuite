import type { FormEvent } from 'react'
import type { FeatureSettings } from '../../../config/featureFlags'
import { formatTryCurrency } from '../../../shared/utils/format'
import { useCashBankTransfer } from '../hooks/useCashBankTransfer'

type CashBankTransferPanelProps = {
  settings: FeatureSettings
}

export function CashBankTransferPanel({ settings }: CashBankTransferPanelProps) {
  const {
    accounts,
    recentTransfers,
    draft,
    isLoading,
    isSubmitting,
    error,
    formError,
    submitSuccessMessage,
    setField,
    submitTransfer,
  } = useCashBankTransfer()

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submitTransfer()
  }

  return (
    <section className="transfer-panel">
      <h3>Hesaplar Arası Transfer</h3>
      <p className="muted">Kasa ve banka hesapları arasında hızlı transfer kaydı oluşturun.</p>

      {isLoading ? <p className="muted">Transfer verileri yükleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {formError ? <p className="error-text">{formError}</p> : null}
      {submitSuccessMessage ? <p className="success-text">{submitSuccessMessage}</p> : null}

      <form className="form-grid transfer-form-grid" onSubmit={onSubmit}>
        <label>
          Kaynak Hesap
          <select value={draft.paid_from} onChange={(event) => setField('paid_from', event.target.value)}>
            <option value="">Seçiniz</option>
            {accounts.map((row) => (
              <option key={row.name} value={row.name}>
                {row.account_name || row.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Hedef Hesap
          <select value={draft.paid_to} onChange={(event) => setField('paid_to', event.target.value)}>
            <option value="">Seçiniz</option>
            {accounts.map((row) => (
              <option key={row.name} value={row.name}>
                {row.account_name || row.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tutar
          <input
            type="number"
            min={0}
            step="0.01"
            value={draft.paid_amount || ''}
            onChange={(event) => setField('paid_amount', Number(event.target.value) || 0)}
          />
        </label>

        <label>
          Tarih
          <input
            type="date"
            value={draft.posting_date}
            onChange={(event) => setField('posting_date', event.target.value)}
          />
        </label>

        <label>
          Şirket
          <input type="text" value={draft.company} onChange={(event) => setField('company', event.target.value)} />
        </label>

        <label>
          Açıklama
          <input type="text" value={draft.remarks || ''} onChange={(event) => setField('remarks', event.target.value)} />
        </label>

        <button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? 'Kaydediliyor...' : 'Transferi Kaydet'}
        </button>
      </form>

      {settings['cash_bank.show_recent_transfer_list'] ? (
        <div className="record-list compact">
          {recentTransfers.map((transfer) => (
            <article key={transfer.name} className="record-card">
              <div>
                <strong>{transfer.name}</strong>
                <span>
                  {transfer.paid_from || '-'} → {transfer.paid_to || '-'}
                </span>
                <span>{transfer.posting_date || '-'}</span>
              </div>
              <div>
                <strong>{formatTryCurrency(transfer.paid_amount ?? 0)}</strong>
                <span>{transfer.company || '-'}</span>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
