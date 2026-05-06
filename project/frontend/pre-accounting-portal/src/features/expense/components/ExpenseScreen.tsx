import { useState } from 'react'
import { validateExpenseInvoiceForm, validateSupplierPaymentForm } from '../../../shared/utils/formValidation'
import { formatTryCurrency } from '../../../shared/utils/format'
import { MobileStepFlow } from '../../../shared/ui/MobileStepFlow'
import { PageSection } from '../../../shared/ui/PageSection'
import { useExpenseData } from '../hooks/useExpenseData'
import { formatApprovalStatusLabel } from '../../approvals/services/approvalService'
import type { ExpenseForm, SupplierPaymentForm } from '../types'

export function ExpenseScreen() {
  const [activeMode, setActiveMode] = useState<'invoice' | 'payment'>('invoice')
  const [activeInvoiceStep, setActiveInvoiceStep] = useState('tedarikci')
  const [activePaymentStep, setActivePaymentStep] = useState('tedarikci')
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
      setActiveInvoiceStep('tedarikci')
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
      setActivePaymentStep('tedarikci')
    }
  }
  const selectedInvoiceSupplierLabel = suppliers.find((supplier) => supplier.name === invoiceForm.supplier)?.label
  const selectedPaymentSupplierLabel = suppliers.find((supplier) => supplier.name === paymentForm.supplier)?.label
  const selectedItemLabel = items.find((item) => item.name === invoiceForm.itemCode)?.label
  const invoicePreviewTotal = invoiceForm.qty * invoiceForm.rate
  const hasPendingPurchaseInvoiceApproval = purchaseInvoices.some((row) => row.approval_status === 'Pending')
  const hasPendingSupplierPaymentApproval = supplierPayments.some((row) => row.approval_status === 'Pending')

  return (
    <PageSection title="Gider ve Ödeme" subtitle="Alış faturası ve tedarikçi ödeme akışları">
      <div className="segmented-control" role="tablist" aria-label="Gider işlemi seçimi">
        <button type="button" className={activeMode === 'invoice' ? 'active' : ''} onClick={() => setActiveMode('invoice')}>
          Alış Faturası
        </button>
        <button type="button" className={activeMode === 'payment' ? 'active' : ''} onClick={() => setActiveMode('payment')}>
          Tedarikçi Ödemesi
        </button>
      </div>

      {activeMode === 'invoice' ? (
        <MobileStepFlow
          steps={[
            { key: 'tedarikci', label: 'Tedarikçi' },
            { key: 'tutar', label: 'Tutar' },
          ]}
          activeStep={activeInvoiceStep}
          onStepChange={setActiveInvoiceStep}
        >
          {activeInvoiceStep === 'tedarikci' ? (
            <div className="form-grid quick-form-grid">
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
              <button
                type="button"
                onClick={() => setActiveInvoiceStep('tutar')}
                disabled={!invoiceForm.supplier || !invoiceForm.itemCode}
              >
                Tutar Adımına Geç
              </button>
            </div>
          ) : (
            <div className="quick-entry-stack">
              <div className="quick-summary-card">
                <span>{selectedInvoiceSupplierLabel || 'Tedarikçi seçilmedi'}</span>
                <strong>{selectedItemLabel || 'Ürün seçilmedi'}</strong>
              </div>
              <div className="form-grid quick-form-grid">
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
              </div>
              <div className="quick-total-row">
                <span>Alış önizleme</span>
                <strong>{formatTryCurrency(invoicePreviewTotal)}</strong>
              </div>
              <button type="button" disabled={isSaving || hasPendingPurchaseInvoiceApproval} onClick={onCreateInvoice}>
                {isSaving ? 'Kaydediliyor...' : 'Alış Faturası Oluştur'}
              </button>
            </div>
          )}
        </MobileStepFlow>
      ) : (
        <MobileStepFlow
          steps={[
            { key: 'tedarikci', label: 'Tedarikçi' },
            { key: 'odeme', label: 'Ödeme' },
          ]}
          activeStep={activePaymentStep}
          onStepChange={setActivePaymentStep}
        >
          {activePaymentStep === 'tedarikci' ? (
            <div className="form-grid quick-form-grid">
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
              <button type="button" onClick={() => setActivePaymentStep('odeme')} disabled={!paymentForm.supplier}>
                Ödeme Adımına Geç
              </button>
            </div>
          ) : (
            <div className="quick-entry-stack">
              <div className="quick-summary-card">
                <span>Ödeme yapılacak tedarikçi</span>
                <strong>{selectedPaymentSupplierLabel || 'Tedarikçi seçilmedi'}</strong>
              </div>
              <div className="form-grid quick-form-grid">
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
              </div>
              <button type="button" disabled={isSaving || hasPendingSupplierPaymentApproval} onClick={onCreatePayment}>
                {isSaving ? 'Kaydediliyor...' : 'Tedarikçi Ödemesi Oluştur'}
              </button>
            </div>
          )}
        </MobileStepFlow>
      )}

      {message ? <p className="muted">{message}</p> : null}
      {hasPendingPurchaseInvoiceApproval ? (
        <p className="error-text">Bekleyen onay oldugu icin yeni alis faturasi kaydi kilitlendi.</p>
      ) : null}
      {hasPendingSupplierPaymentApproval ? (
        <p className="error-text">Bekleyen onay oldugu icin yeni tedarikci odemesi kaydi kilitlendi.</p>
      ) : null}
      {isLoading ? <p className="muted">Gider ve ödeme verisi yükleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Alış Faturası</th>
              <th>Tedarikçi</th>
              <th>Toplam</th>
              <th>Kalan</th>
              <th>Vade</th>
              <th>Durum</th>
              <th>Onay Durumu</th>
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
                <td>{formatApprovalStatusLabel(row.approval_status)}</td>
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
              <th>Yöntem</th>
              <th>Durum</th>
              <th>Onay Durumu</th>
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
                <td>{formatApprovalStatusLabel(row.approval_status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
