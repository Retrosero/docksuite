import { useState } from 'react'
import { validateExpenseInvoiceForm, validateSupplierPaymentForm } from '../../../shared/utils/formValidation'
import { formatTryCurrency } from '../../../shared/utils/format'
import { PageSection } from '../../../shared/ui/PageSection'
import { useExpenseData } from '../hooks/useExpenseData'
import type { ExpenseForm, SupplierPaymentForm } from '../types'

export function ExpenseScreen() {
  const [message, setMessage] = useState<string | null>(null)
  const {
    purchaseInvoices,
    supplierPayments,
    suppliers,
    items,
    modes,
    isLoading,
    isSaving,
    error,
    savePurchaseInvoice,
    saveSupplierPayment,
  } = useExpenseData()

  const [invoiceForm, setInvoiceForm] = useState<ExpenseForm>({
    supplier: '',
    itemCode: '',
    qty: 1,
    rate: 0,
  })
  const [paymentForm, setPaymentForm] = useState<SupplierPaymentForm>({
    supplier: '',
    paidAmount: 0,
    modeOfPayment: '',
  })

  const onCreateInvoice = async () => {
    setMessage(null)
    const validationError = validateExpenseInvoiceForm(invoiceForm)
    if (validationError) {
      setMessage(validationError)
      return
    }
    const name = await savePurchaseInvoice(invoiceForm)
    if (name) {
      setMessage(`Alış faturası oluşturuldu: ${name}`)
      setInvoiceForm({ supplier: '', itemCode: '', qty: 1, rate: 0 })
    }
  }

  const onCreatePayment = async () => {
    setMessage(null)
    const validationError = validateSupplierPaymentForm(paymentForm)
    if (validationError) {
      setMessage(validationError)
      return
    }
    const name = await saveSupplierPayment(paymentForm)
    if (name) {
      setMessage(`Tedarikçi ödemesi oluşturuldu: ${name}`)
      setPaymentForm({ supplier: '', paidAmount: 0, modeOfPayment: '' })
    }
  }

  return (
    <PageSection title="Gider ve Ödeme" subtitle="Alış faturası ve tedarikçi ödeme akışları">
      <div className="form-grid">
        <label>
          Tedarikçi
          <select
            value={invoiceForm.supplier}
            onChange={(event) => setInvoiceForm((prev) => ({ ...prev, supplier: event.target.value }))}
          >
            <option value="">Seçiniz</option>
            {suppliers.map((supplier) => (
              <option key={supplier.name} value={supplier.name}>
                {supplier.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ürün
          <select
            value={invoiceForm.itemCode}
            onChange={(event) => setInvoiceForm((prev) => ({ ...prev, itemCode: event.target.value }))}
          >
            <option value="">Seçiniz</option>
            {items.map((item) => (
              <option key={item.name} value={item.name}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Miktar
          <input
            type="number"
            min={1}
            value={invoiceForm.qty}
            onChange={(event) => setInvoiceForm((prev) => ({ ...prev, qty: Number(event.target.value) }))}
          />
        </label>
        <label>
          Birim Fiyat
          <input
            type="number"
            min={0}
            step="0.01"
            value={invoiceForm.rate}
            onChange={(event) => setInvoiceForm((prev) => ({ ...prev, rate: Number(event.target.value) }))}
          />
        </label>
        <button type="button" disabled={isSaving} onClick={onCreateInvoice}>
          {isSaving ? 'Kaydediliyor...' : 'Alis Faturasi Olustur'}
        </button>
      </div>

      <div className="form-grid">
        <label>
          Ödenecek Tedarikçi
          <select
            value={paymentForm.supplier}
            onChange={(event) => setPaymentForm((prev) => ({ ...prev, supplier: event.target.value }))}
          >
            <option value="">Seçiniz</option>
            {suppliers.map((supplier) => (
              <option key={supplier.name} value={supplier.name}>
                {supplier.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ödeme Yöntemi
          <select
            value={paymentForm.modeOfPayment}
            onChange={(event) => setPaymentForm((prev) => ({ ...prev, modeOfPayment: event.target.value }))}
          >
            <option value="">Seçiniz</option>
            {modes.map((mode) => (
              <option key={mode.name} value={mode.name}>
                {mode.label}
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
            value={paymentForm.paidAmount}
            onChange={(event) => setPaymentForm((prev) => ({ ...prev, paidAmount: Number(event.target.value) }))}
          />
        </label>
        <button type="button" disabled={isSaving} onClick={onCreatePayment}>
          {isSaving ? 'Kaydediliyor...' : 'Tedarikçi Ödemesi Oluştur'}
        </button>
      </div>

      {message ? <p className="muted">{message}</p> : null}
      {isLoading ? <p className="muted">Gider ve ödeme verisi yükleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Alis Faturasi</th>
              <th>Tedarikçi</th>
              <th>Toplam</th>
              <th>Kalan</th>
              <th>Vade</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {purchaseInvoices.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.supplier_name || row.supplier}</td>
                <td>{formatTryCurrency(row.grand_total ?? 0)}</td>
                <td>{formatTryCurrency(row.outstanding_amount ?? 0)}</td>
                <td>{row.due_date || '-'}</td>
                <td>{row.docstatus === 1 ? 'Kesildi' : 'Taslak'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ödeme No</th>
              <th>Tedarikçi</th>
              <th>Tutar</th>
              <th>Yontem</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {supplierPayments.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.party || '-'}</td>
                <td>{formatTryCurrency(row.paid_amount ?? 0)}</td>
                <td>{row.mode_of_payment || '-'}</td>
                <td>{row.docstatus === 1 ? 'Onaylı' : 'Taslak'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
