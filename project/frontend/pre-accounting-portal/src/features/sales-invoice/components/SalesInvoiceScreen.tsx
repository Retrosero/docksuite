import { useEffect, useMemo, useState } from 'react'
import type { FeatureSettings } from '../../../config/featureFlags'
import { useQueryBackedFilter } from '../../../shared/hooks/useQueryBackedFilter'
import { PageSection } from '../../../shared/ui/PageSection'
import { formatTryCurrency } from '../../../shared/utils/format'
import { validateSalesInvoiceForm, validateSalesQuotationForm } from '../../../shared/utils/formValidation'
import { formatApprovalStatusLabel } from '../../approvals/services/approvalService'
import { useSalesInvoiceData } from '../hooks/useSalesInvoiceData'
import {
  buildEDocumentReadinessSummary,
  buildQuotationConversionSummary,
  buildSalesReturnReadinessSummary,
} from '../services/salesInvoiceService'
import { getPaymentTypeMap } from '../../settings/services/paymentTypeMapService'
import type { SalesInvoiceForm, SalesQuotationForm } from '../types'

type SalesInvoiceScreenProps = {
  settings: FeatureSettings
}

function getDefaultValidTill() {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().slice(0, 10)
}

function getDefaultDueDate() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

export function SalesInvoiceScreen({ settings }: SalesInvoiceScreenProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isQuotationOpen, setIsQuotationOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [quickItemCode, setQuickItemCode] = useState('')
  const [quickQty, setQuickQty] = useState(1)
  const [paymentModeMap, setPaymentModeMap] = useState<Record<'Nakit' | 'Havale' | 'Kredi Kartı', string>>({
    Nakit: '',
    Havale: '',
    'Kredi Kartı': '',
  })
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
  const { invoices, quotations, customers, items, modeOfPayments, isLoading, isSaving, isSavingQuotation, error, saveInvoice, saveQuotation } = useSalesInvoiceData()

  const [form, setForm] = useState<SalesInvoiceForm>({
    customer: '',
    items: [],
    paymentType: 'Nakit',
    modeOfPayment: '',
    dueDate: getDefaultDueDate(),
  })
  const [quotationForm, setQuotationForm] = useState<SalesQuotationForm>({
    customer: '',
    itemCode: '',
    qty: 1,
    rate: 0,
    validTill: getDefaultValidTill(),
  })

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const mapping = await getPaymentTypeMap()
        if (!active) return
        setPaymentModeMap({
          Nakit: mapping.Nakit || '',
          Havale: mapping.Havale || '',
          'Kredi Kartı': mapping['Kredi Kartı'] || '',
        })
      } catch {
        // Sessiz gec
      }
    })()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (modeOfPayments.length === 0) return
    const findDefault = (keywords: string[]) =>
      modeOfPayments.find((name) => keywords.some((keyword) => name.toLowerCase().includes(keyword))) || modeOfPayments[0]
    setPaymentModeMap((prev) => ({
      Nakit: prev.Nakit || findDefault(['nakit', 'cash']),
      Havale: prev.Havale || findDefault(['havale', 'eft', 'banka', 'transfer']),
      'Kredi Kartı': prev['Kredi Kartı'] || findDefault(['kredi', 'kart', 'card', 'pos']),
    }))
  }, [modeOfPayments])

  const addQuickItemToCart = () => {
    if (!quickItemCode || quickQty <= 0) return
    const selectedItem = items.find((row) => row.name === quickItemCode)
    const defaultRate = selectedItem?.standard_rate ?? 0
    setForm((prev) => {
      const existingIndex = prev.items.findIndex((line) => line.itemCode === quickItemCode)
      if (existingIndex >= 0) {
        return {
          ...prev,
          items: prev.items.map((line, index) =>
            index === existingIndex ? { ...line, qty: line.qty + quickQty } : line,
          ),
        }
      }
      return {
        ...prev,
        items: [
          ...prev.items,
          { itemCode: quickItemCode, qty: quickQty, rate: defaultRate, discountPercent: 0 },
        ],
      }
    })
    setQuickItemCode(selectedItem?.name || '')
    setQuickQty(1)
  }

  const onCreate = async () => {
    setMessage(null)
    const resolvedMode = form.paymentType === 'Vadeli' ? '' : paymentModeMap[form.paymentType as 'Nakit' | 'Havale' | 'Kredi Kartı']
    const payload: SalesInvoiceForm = {
      ...form,
      modeOfPayment: resolvedMode,
    }
    const validationError = validateSalesInvoiceForm(payload)
    if (validationError) {
      setMessage(validationError)
      return
    }
    const name = await saveInvoice(payload)
    if (name) {
      setMessage(`Satis faturasi olusturuldu: ${name}`)
      setForm({ customer: '', items: [], paymentType: 'Nakit', modeOfPayment: '', dueDate: getDefaultDueDate() })
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
      setMessage(`Teklif olusturuldu: ${name}`)
      setQuotationForm({ customer: '', itemCode: '', qty: 1, rate: 0, validTill: getDefaultValidTill() })
      setIsQuotationOpen(false)
    }
  }

  const selectedCustomerLabel = customers.find((customer) => customer.name === form.customer)?.label
  const cartTotal = useMemo(
    () =>
      form.items.reduce((sum, line) => {
        const gross = line.qty * line.rate
        return sum + (gross - gross * (line.discountPercent / 100))
      }, 0),
    [form.items],
  )
  const quotationConversionSummary = buildQuotationConversionSummary(quotations)
  const eDocumentSummary = buildEDocumentReadinessSummary(invoices)
  const returnSummary = buildSalesReturnReadinessSummary(invoices)
  const normalizedCustomerSearch = customerSearch.trim().toLowerCase()
  const normalizedInvoiceSearch = invoiceSearch.trim().toLowerCase()
  const filteredInvoices = invoices.filter((invoice) => {
    const status = invoice.docstatus === 1 ? 'Kesildi' : 'Taslak'
    if (statusFilter !== 'Hepsi' && statusFilter !== status) return false
    if (normalizedCustomerSearch && !(invoice.customer_name || invoice.customer).toLowerCase().includes(normalizedCustomerSearch)) return false
    if (normalizedInvoiceSearch && !invoice.name.toLowerCase().includes(normalizedInvoiceSearch)) return false
    return true
  })
  const hasPendingInvoiceApproval = invoices.some((invoice) => invoice.approval_status === 'Pending')
  const paymentLabels = ['Nakit', 'Vadeli', 'Havale', 'Kredi Kartı'] as const

  return (
    <PageSection title="Satis Faturalari" subtitle="Hizli sepet ve odeme odakli satis islemleri">
      <div className="toolbar">
        <button type="button" onClick={() => setIsCreateOpen((value) => !value)}>
          {isCreateOpen ? 'Formu Kapat' : 'Yeni Satis'}
        </button>
        {settings['sales_invoice.show_quotation_flow'] ? (
          <button type="button" className="ghost" onClick={() => setIsQuotationOpen((value) => !value)}>
            {isQuotationOpen ? 'Teklifi Kapat' : 'Yeni Teklif'}
          </button>
        ) : null}
      </div>
      {isCreateOpen ? (
        <div className="quick-entry-stack card-create-panel">
          <div className="form-grid quick-form-grid">
            <label>
              Musteri
              <select value={form.customer} onChange={(event) => setForm((prev) => ({ ...prev, customer: event.target.value }))}>
                <option value="">Seciniz</option>
                {customers.map((customer) => (
                  <option key={customer.name} value={customer.name}>{customer.label}</option>
                ))}
              </select>
            </label>
            <label>
              Odeme Tipi
              <select value={form.paymentType} onChange={(event) => setForm((prev) => ({ ...prev, paymentType: event.target.value as SalesInvoiceForm['paymentType'] }))}>
                {paymentLabels.map((method) => <option key={method} value={method}>{method}</option>)}
              </select>
            </label>
            {form.paymentType !== 'Vadeli' ? (
              <label>
                ERP Odeme Yontemi
                <select
                  value={paymentModeMap[form.paymentType as 'Nakit' | 'Havale' | 'Kredi Kartı']}
                  onChange={(event) =>
                    setPaymentModeMap((prev) => ({
                      ...prev,
                      [form.paymentType]: event.target.value,
                    }))
                  }
                >
                  <option value="">Seciniz</option>
                  {modeOfPayments.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                </select>
              </label>
            ) : null}
            {form.paymentType === 'Vadeli' ? (
              <label>
                Vade Tarihi
                <input type="date" value={form.dueDate || ''} onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))} />
              </label>
            ) : null}
          </div>
          <div className="form-grid quick-form-grid">
            <label>
              Urun
              <select value={quickItemCode} onChange={(event) => setQuickItemCode(event.target.value)}>
                <option value="">Seciniz</option>
                {items.map((item) => <option key={item.name} value={item.name}>{item.label}</option>)}
              </select>
            </label>
            <label>
              Adet
              <input type="number" min={1} value={quickQty} onChange={(event) => setQuickQty(Number(event.target.value))} />
            </label>
            <div className="quick-action-cell">
              <button type="button" onClick={addQuickItemToCart} disabled={!quickItemCode || quickQty <= 0}>Sepete Ekle</button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Urun</th>
                  <th>Adet</th>
                  <th>Fiyat</th>
                  <th>Iskonto %</th>
                  <th>Tutar</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((line, index) => {
                  const lineGross = line.qty * line.rate
                  const lineNet = lineGross - (lineGross * line.discountPercent / 100)
                  return (
                    <tr key={`${line.itemCode}-${index}`}>
                      <td>{items.find((item) => item.name === line.itemCode)?.label || line.itemCode}</td>
                      <td><input type="number" min={1} value={line.qty} onChange={(event) => setForm((prev) => ({ ...prev, items: prev.items.map((row, rowIndex) => rowIndex === index ? { ...row, qty: Number(event.target.value) } : row) }))} /></td>
                      <td><input type="number" min={0} step="0.01" value={line.rate} onChange={(event) => setForm((prev) => ({ ...prev, items: prev.items.map((row, rowIndex) => rowIndex === index ? { ...row, rate: Number(event.target.value) } : row) }))} /></td>
                      <td><input type="number" min={0} max={100} step="1" value={line.discountPercent} onChange={(event) => setForm((prev) => ({ ...prev, items: prev.items.map((row, rowIndex) => rowIndex === index ? { ...row, discountPercent: Number(event.target.value) } : row) }))} /></td>
                      <td>{formatTryCurrency(lineNet)}</td>
                      <td><button type="button" className="ghost" onClick={() => setForm((prev) => ({ ...prev, items: prev.items.filter((_, rowIndex) => rowIndex !== index) }))}>Sil</button></td>
                    </tr>
                  )
                })}
                {form.items.length === 0 ? <tr><td colSpan={6} className="muted">Sepet bos.</td></tr> : null}
              </tbody>
            </table>
          </div>

          <div className="quick-total-row">
            <span>{selectedCustomerLabel || 'Musteri secilmedi'} · {form.paymentType}</span>
            <strong>{formatTryCurrency(cartTotal)}</strong>
          </div>
          {modeOfPayments.length > 0 ? <p className="muted">ERP odeme tipleri yuklendi ({modeOfPayments.length}).</p> : <p className="muted">ERP odeme tipleri yuklenemedi.</p>}
          <button type="button" onClick={onCreate} disabled={isSaving || hasPendingInvoiceApproval}>
            {isSaving ? 'Kaydediliyor...' : 'Satisi Tamamla'}
          </button>
        </div>
      ) : null}
      {settings['sales_invoice.show_quotation_flow'] && isQuotationOpen ? (
        <div className="quick-entry-stack card-create-panel">
          <div className="form-grid quick-form-grid">
            <label>
              Musteri
              <select value={quotationForm.customer} onChange={(event) => setQuotationForm((prev) => ({ ...prev, customer: event.target.value }))}>
                <option value="">Seciniz</option>
                {customers.map((customer) => <option key={customer.name} value={customer.name}>{customer.label}</option>)}
              </select>
            </label>
            <label>
              Urun
              <select value={quotationForm.itemCode} onChange={(event) => setQuotationForm((prev) => ({ ...prev, itemCode: event.target.value }))}>
                <option value="">Seciniz</option>
                {items.map((item) => <option key={item.name} value={item.name}>{item.label}</option>)}
              </select>
            </label>
            <label>
              Miktar
              <input type="number" min={1} value={quotationForm.qty} onChange={(event) => setQuotationForm((prev) => ({ ...prev, qty: Number(event.target.value) }))} />
            </label>
            <label>
              Birim Fiyat
              <input type="number" min={0} step="0.01" value={quotationForm.rate} onChange={(event) => setQuotationForm((prev) => ({ ...prev, rate: Number(event.target.value) }))} />
            </label>
            <label>
              Gecerlilik Tarihi
              <input type="date" value={quotationForm.validTill} onChange={(event) => setQuotationForm((prev) => ({ ...prev, validTill: event.target.value }))} />
            </label>
          </div>
          <button type="button" onClick={onCreateQuotation} disabled={isSavingQuotation}>
            {isSavingQuotation ? 'Kaydediliyor...' : 'Teklifi Kaydet'}
          </button>
        </div>
      ) : null}
      {message ? <p className="muted">{message}</p> : null}
      {hasPendingInvoiceApproval ? <p className="error-text">Bekleyen onay oldugu icin yeni fatura kaydi kilitlendi.</p> : null}
      {isLoading ? <p className="muted">Satis faturasi verisi yukleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {settings['sales_invoice.show_e_document_readiness'] ? (
        <div className="e-document-panel"><div><h3>E-belge Hazirligi</h3><p>Kesilmis faturalar e-fatura/e-arsiv sureci icin izlenir.</p></div><div className="metric-grid"><div className="metric-card"><h3>Hazir Fatura</h3><strong>{eDocumentSummary.readyCount}</strong></div><div className="metric-card"><h3>Taslak Bekleyen</h3><strong>{eDocumentSummary.draftCount}</strong></div><div className="metric-card"><h3>Hazir Tutar</h3><strong>{formatTryCurrency(eDocumentSummary.totalAmount)}</strong></div></div></div>
      ) : null}
      {settings['sales_invoice.show_return_readiness'] ? (
        <div className="return-readiness-panel"><div><h3>Iptal ve Iade Hazirligi</h3><p>Kesilmis faturalar iade akisina uygunluk icin izlenir.</p></div><div className="metric-grid"><div className="metric-card"><h3>Iade Adayi</h3><strong>{returnSummary.returnableCount}</strong></div><div className="metric-card"><h3>Iade Kaydi</h3><strong>{returnSummary.returnInvoiceCount}</strong></div><div className="metric-card"><h3>Taslak Bekleyen</h3><strong>{returnSummary.draftCount}</strong></div></div></div>
      ) : null}
      {settings['sales_invoice.show_quotation_conversion_readiness'] ? (
        <div className="quotation-conversion-panel"><div><h3>Teklif Donusum Hazirligi</h3><p>Onayli ve acik teklifler fatura/siparise donusum icin izlenir.</p></div><div className="metric-grid"><div className="metric-card"><h3>Donusum Adayi</h3><strong>{quotationConversionSummary.convertibleCount}</strong></div><div className="metric-card"><h3>Donusmus</h3><strong>{quotationConversionSummary.convertedCount}</strong></div><div className="metric-card"><h3>Taslak Teklif</h3><strong>{quotationConversionSummary.draftCount}</strong></div></div></div>
      ) : null}

      <div className="form-grid">
        <label>
          Durum
          <select value={statusFilter} onChange={(event) => setStatusFilterRaw(event.target.value)}>
            <option value="Hepsi">Hepsi</option><option value="Taslak">Taslak</option><option value="Kesildi">Kesildi</option>
          </select>
        </label>
        <label>
          Cari Ara
          <input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Musteri" />
        </label>
        <label>
          Fatura No Ara
          <input value={invoiceSearch} onChange={(event) => setInvoiceSearch(event.target.value)} placeholder="SINV-0001" />
        </label>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Belge No</th><th>Cari</th><th>Tutar</th><th>Durum</th><th>Onay Durumu</th></tr></thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.name}>
                <td>{invoice.name}</td>
                <td>{invoice.customer_name || invoice.customer}</td>
                <td>{formatTryCurrency(invoice.grand_total ?? 0)}</td>
                <td>{invoice.docstatus === 1 ? 'Kesildi' : 'Taslak'}</td>
                <td>{formatApprovalStatusLabel(invoice.approval_status)}</td>
              </tr>
            ))}
            {!isLoading && filteredInvoices.length === 0 ? <tr><td colSpan={5} className="muted">Filtreye uygun satis faturasi bulunamadi.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
