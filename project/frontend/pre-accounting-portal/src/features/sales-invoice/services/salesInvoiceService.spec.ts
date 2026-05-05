import { describe, expect, it } from 'vitest'
import {
  buildEDocumentReadinessSummary,
  buildQuotationConversionSummary,
  buildSalesReturnReadinessSummary,
} from './salesInvoiceService'
import type { SalesInvoiceItem, SalesQuotationItem } from '../types'

describe('buildEDocumentReadinessSummary', () => {
  it('kesilmis faturalari e-belge hazir adaylari olarak ozetler', () => {
    const invoices: SalesInvoiceItem[] = [
      { name: 'SINV-0003', customer: 'MUSTERI-003', grand_total: 750, docstatus: 1 },
      { name: 'SINV-0002', customer: 'MUSTERI-002', grand_total: 250, docstatus: 0 },
      { name: 'SINV-0001', customer: 'MUSTERI-001', grand_total: 500, docstatus: 1 },
    ]

    expect(buildEDocumentReadinessSummary(invoices)).toEqual({
      readyCount: 2,
      draftCount: 1,
      totalAmount: 1250,
      latestReadyInvoice: 'SINV-0003',
    })
  })

  it('kesilmis fatura yoksa son aday bilgisini bos birakir', () => {
    const invoices: SalesInvoiceItem[] = [
      { name: 'SINV-0002', customer: 'MUSTERI-002', grand_total: 250, docstatus: 0 },
    ]

    expect(buildEDocumentReadinessSummary(invoices)).toEqual({
      readyCount: 0,
      draftCount: 1,
      totalAmount: 0,
      latestReadyInvoice: undefined,
    })
  })
})

describe('buildSalesReturnReadinessSummary', () => {
  it('kesilmis normal faturalari iade hazir adayi olarak ozetler', () => {
    const invoices: SalesInvoiceItem[] = [
      { name: 'SINV-0004', customer: 'MUSTERI-004', grand_total: 800, docstatus: 1, is_return: 0 },
      { name: 'SINV-0003', customer: 'MUSTERI-003', grand_total: -200, docstatus: 1, is_return: 1, return_against: 'SINV-0001' },
      { name: 'SINV-0002', customer: 'MUSTERI-002', grand_total: 250, docstatus: 0, is_return: 0 },
      { name: 'SINV-0001', customer: 'MUSTERI-001', grand_total: 500, docstatus: 1, is_return: 0 },
    ]

    expect(buildSalesReturnReadinessSummary(invoices)).toEqual({
      returnableCount: 2,
      returnInvoiceCount: 1,
      draftCount: 1,
      latestReturnableInvoice: 'SINV-0004',
    })
  })
})

describe('buildQuotationConversionSummary', () => {
  it('onayli ve henuz donusmemis teklifleri donusum adayi olarak ozetler', () => {
    const quotations: SalesQuotationItem[] = [
      { name: 'QTN-0004', party_name: 'MUSTERI-004', docstatus: 1, status: 'Open' },
      { name: 'QTN-0003', party_name: 'MUSTERI-003', docstatus: 1, status: 'Ordered' },
      { name: 'QTN-0002', party_name: 'MUSTERI-002', docstatus: 0, status: 'Draft' },
      { name: 'QTN-0001', party_name: 'MUSTERI-001', docstatus: 1, status: 'Submitted' },
    ]

    expect(buildQuotationConversionSummary(quotations)).toEqual({
      convertibleCount: 2,
      convertedCount: 1,
      draftCount: 1,
      latestConvertibleQuotation: 'QTN-0004',
    })
  })
})
