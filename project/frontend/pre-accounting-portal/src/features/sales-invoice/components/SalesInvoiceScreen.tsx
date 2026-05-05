import type { FeatureSettings } from '../../../config/featureFlags'
import { useState } from 'react'
import { useQueryBackedFilter } from '../../../shared/hooks/useQueryBackedFilter'
import { validateSalesInvoiceForm, validateSalesQuotationForm } from '../../../shared/utils/formValidation'
import { formatTryCurrency } from '../../../shared/utils/format'
import { MobileStepFlow } from '../../../shared/ui/MobileStepFlow'
import { PageSection } from '../../../shared/ui/PageSection'
import { useSalesInvoiceData } from '../hooks/useSalesInvoiceData'
import type { SalesInvoiceForm, SalesQuotationForm } from '../types'

type SalesInvoiceScreenProps = {
  settings: FeatureSettings
}

function getDefaultValidTill() {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().slice(0, 10)
}

export function SalesInvoiceScreen({ settings }: SalesInvoiceScreenProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isQuotationOpen, setIsQuotationOpen] = useState(false)
  const [activeCreateStep, setActiveCreateStep] = useState('cari')
  const [activeQuotationStep, setActiveQuotationStep] = useState('cari')
  const [message, setMessage] = useState<string | null>(null)
  const [statusFilterRaw, setStatusFilterRaw] = useQueryBackedFilter({
    queryKey: 'si_status',
    storageKey: 'sales_invoice_filter_status',
    defaultValue: 'Hepsi',
    allowedValues: ['Hepsi', 'Taslak', 'Kesildi'],
  })
  const [customerSearch, setCustomerSearch] = useQueryBackedFilter({
    queryKey: 'si_customer',
    storageKey: 'sales_invoice_filter_customer',
    defaultValue: '',
  })
  const [invoiceSearch, setInvoiceSearch] = useQueryBackedFilter({
    queryKey: 'si_invoice',
    storageKey: 'sales_invoice_filter_invoice',
    defaultValue: '',
  })
  const statusFilter = statusFilterRaw as 'Hepsi' | 'Taslak' | 'Kesildi'
  const {
    invoices,
    quotations,
    customers,
    items,
    isLoading,
    isSaving,
    isSavingQuotation,
    error,
    saveInvoice,
    saveQuotation,
  } = useSalesInvoiceData()

  const [form, setForm] = useState<SalesInvoiceForm>({
    customer: '',
    itemCode: '',
    qty: 1,
    rate: 0,
  })
  const [quotationForm, setQuotationForm] = useState<SalesQuotationForm>({
    customer: '',
    itemCode: '',
    qty: 1,
    rate: 0,
    validTill: getDefaultValidTill(),
  })

  const onCreate = async () => {
    setMessage(null)
    const validationError = validateSalesInvoiceForm(form)
    if (validationError) {
      setMessage(validationError)
      return
    }
    const name = await saveInvoice(form)
    if (name) {
      setMessage(`Fatura oluşturuldu: ${name}`)
      setForm({ customer: '', itemCode: '', qty: 1, rate: 0 })
      setActiveCreateStep('cari')
      setIsCreateOpen(false)
    }
  }
  const onCreateQuotation = async () => {
    setMessage(null)
    const validationError = validateSalesQuotationForm(quotationForm)
    if (validationError) {
      setMessage(validationError)
      return
    }
    const name = await saveQuotation(quotationForm)
    if (name) {
      setMessage(`Teklif oluşturuldu: ${name}`)
      setQuotationForm({ customer: '', itemCode: '', qty: 1, rate: 0, validTill: getDefaultValidTill() })
      setActiveQuotationStep('cari')
      setIsQuotationOpen(false)
    }
  }
  const selectedCustomerLabel = customers.find((customer) => customer.name === form.customer)?.label
  const selectedItemLabel = items.find((item) => item.name === form.itemCode)?.label
  const selectedQuotationCustomerLabel = customers.find((customer) => customer.name === quotationForm.customer)?.label
  const selectedQuotationItemLabel = items.find((item) => item.name === quotationForm.itemCode)?.label
  const invoicePreviewTotal = form.qty * form.rate
  const quotationPreviewTotal = quotationForm.qty * quotationForm.rate
  const normalizedCustomerSearch = customerSearch.trim().toLowerCase()
  const normalizedInvoiceSearch = invoiceSearch.trim().toLowerCase()
  const filteredInvoices = invoices.filter((invoice) => {
    const status = invoice.docstatus === 1 ? 'Kesildi' : 'Taslak'
    if (statusFilter !== 'Hepsi' && statusFilter !== status) return false
    if (normalizedCustomerSearch && !(invoice.customer_name || invoice.customer).toLowerCase().includes(normalizedCustomerSearch)) {
      return false
    }
    if (normalizedInvoiceSearch && !invoice.name.toLowerCase().includes(normalizedInvoiceSearch)) return false
    return true
  })

  return (
    <PageSection title="Satış Faturaları" subtitle="Taslak ve kesilen faturalar">
      <div className="toolbar">
        <button type="button" onClick={() => setIsCreateOpen((value) => !value)}>
          {isCreateOpen ? 'Formu Kapat' : 'Yeni Fatura'}
        </button>
        {settings['sales_invoice.show_quotation_flow'] ? (
          <button type="button" className="ghost" onClick={() => setIsQuotationOpen((value) => !value)}>
            {isQuotationOpen ? 'Teklifi Kapat' : 'Yeni Teklif'}
          </button>
        ) : null}
        {settings['sales_invoice.show_discount_button'] ? (
          <button type="button" className="ghost">
            İskonto Uygula
          </button>
        ) : null}
      </div>
      {isCreateOpen ? (
        <MobileStepFlow
          steps={[
            { key: 'cari', label: 'Cari ve ürün' },
            { key: 'tutar', label: 'Tutar' },
          ]}
          activeStep={activeCreateStep}
          onStepChange={setActiveCreateStep}
        >
          {activeCreateStep === 'cari' ? (
            <div className="form-grid quick-form-grid">
              <label>
                Müşteri
                <select value={form.customer} onChange={(event) => setForm((prev) => ({ ...prev, customer: event.target.value }))}>
                  <option value="">Seçiniz</option>
                  {customers.map((customer) => (
                    <option key={customer.name} value={customer.name}>
                      {customer.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Ürün
                <select value={form.itemCode} onChange={(event) => setForm((prev) => ({ ...prev, itemCode: event.target.value }))}>
                  <option value="">Seçiniz</option>
                  {items.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={() => setActiveCreateStep('tutar')} disabled={!form.customer || !form.itemCode}>
                Tutar Adımına Geç
              </button>
            </div>
          ) : (
            <div className="quick-entry-stack">
              <div className="quick-summary-card">
                <span>{selectedCustomerLabel || 'Müşteri seçilmedi'}</span>
                <strong>{selectedItemLabel || 'Ürün seçilmedi'}</strong>
              </div>
              <div className="form-grid quick-form-grid">
                <label>
                  Miktar
                  <input
                    type="number"
                    min={1}
                    value={form.qty}
                    onChange={(event) => setForm((prev) => ({ ...prev, qty: Number(event.target.value) }))}
                  />
                </label>
                <label>
                  Birim Fiyat
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.rate}
                    onChange={(event) => setForm((prev) => ({ ...prev, rate: Number(event.target.value) }))}
                  />
                </label>
              </div>
              <div className="quick-total-row">
                <span>Fatura önizleme</span>
                <strong>{formatTryCurrency(invoicePreviewTotal)}</strong>
              </div>
              <button type="button" onClick={onCreate} disabled={isSaving}>
                {isSaving ? 'Kaydediliyor...' : 'Faturayı Kaydet'}
              </button>
            </div>
          )}
        </MobileStepFlow>
      ) : null}
      {settings['sales_invoice.show_quotation_flow'] && isQuotationOpen ? (
        <MobileStepFlow
          steps={[
            { key: 'cari', label: 'Cari ve ürün' },
            { key: 'teklif', label: 'Teklif' },
          ]}
          activeStep={activeQuotationStep}
          onStepChange={setActiveQuotationStep}
        >
          {activeQuotationStep === 'cari' ? (
            <div className="form-grid quick-form-grid">
              <label>
                Müşteri
                <select
                  value={quotationForm.customer}
                  onChange={(event) => setQuotationForm((prev) => ({ ...prev, customer: event.target.value }))}
                >
                  <option value="">Seçiniz</option>
                  {customers.map((customer) => (
                    <option key={customer.name} value={customer.name}>
                      {customer.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Ürün
                <select
                  value={quotationForm.itemCode}
                  onChange={(event) => setQuotationForm((prev) => ({ ...prev, itemCode: event.target.value }))}
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
                onClick={() => setActiveQuotationStep('teklif')}
                disabled={!quotationForm.customer || !quotationForm.itemCode}
              >
                Teklif Adımına Geç
              </button>
            </div>
          ) : (
            <div className="quick-entry-stack">
              <div className="quick-summary-card">
                <span>{selectedQuotationCustomerLabel || 'Müşteri seçilmedi'}</span>
                <strong>{selectedQuotationItemLabel || 'Ürün seçilmedi'}</strong>
              </div>
              <div className="form-grid quick-form-grid">
                <label>
                  Miktar
                  <input
                    type="number"
                    min={1}
                    value={quotationForm.qty}
                    onChange={(event) => setQuotationForm((prev) => ({ ...prev, qty: Number(event.target.value) }))}
                  />
                </label>
                <label>
                  Birim Fiyat
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={quotationForm.rate}
                    onChange={(event) => setQuotationForm((prev) => ({ ...prev, rate: Number(event.target.value) }))}
                  />
                </label>
                <label>
                  Geçerlilik Tarihi
                  <input
                    type="date"
                    value={quotationForm.validTill}
                    onChange={(event) => setQuotationForm((prev) => ({ ...prev, validTill: event.target.value }))}
                  />
                </label>
              </div>
              <div className="quick-total-row">
                <span>Teklif önizleme</span>
                <strong>{formatTryCurrency(quotationPreviewTotal)}</strong>
              </div>
              <button type="button" onClick={onCreateQuotation} disabled={isSavingQuotation}>
                {isSavingQuotation ? 'Kaydediliyor...' : 'Teklifi Kaydet'}
              </button>
            </div>
          )}
        </MobileStepFlow>
      ) : null}
      {message ? <p className="muted">{message}</p> : null}
      {isLoading ? <p className="muted">Satış faturası verisi yükleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {settings['sales_invoice.show_quotation_flow'] ? (
        <div className="record-list compact">
          <h3 className="subsection-title">Son Teklifler</h3>
          {quotations.slice(0, 4).map((quotation) => (
            <article className="record-card" key={quotation.name}>
              <div>
                <strong>{quotation.name}</strong>
                <span>{quotation.customer_name || quotation.party_name}</span>
              </div>
              <div>
                <strong>{formatTryCurrency(quotation.grand_total ?? 0)}</strong>
                <span>{quotation.status || (quotation.docstatus === 1 ? 'Onaylandı' : 'Taslak')}</span>
              </div>
            </article>
          ))}
          {!isLoading && quotations.length === 0 ? <p className="muted">Henüz satış teklifi bulunamadı.</p> : null}
        </div>
      ) : null}
      <div className="form-grid">
        <label>
          Durum
          <select value={statusFilter} onChange={(event) => setStatusFilterRaw(event.target.value)}>
            <option value="Hepsi">Hepsi</option>
            <option value="Taslak">Taslak</option>
            <option value="Kesildi">Kesildi</option>
          </select>
        </label>
        <label>
          Cari Ara
          <input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Müşteri" />
        </label>
        <label>
          Fatura No Ara
          <input value={invoiceSearch} onChange={(event) => setInvoiceSearch(event.target.value)} placeholder="SINV-0001" />
        </label>
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
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.name}>
                <td>{invoice.name}</td>
                <td>{invoice.customer_name || invoice.customer}</td>
                <td>{formatTryCurrency(invoice.grand_total ?? 0)}</td>
                <td>{invoice.docstatus === 1 ? 'Kesildi' : 'Taslak'}</td>
              </tr>
            ))}
            {!isLoading && filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">
                  Filtreye uygun satış faturası bulunamadı.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
