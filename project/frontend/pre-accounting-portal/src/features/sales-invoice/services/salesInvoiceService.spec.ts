import { describe, expect, it } from 'vitest'
import { buildEDocumentReadinessSummary, buildSalesReturnReadinessSummary } from './salesInvoiceService'
import type { SalesInvoiceItem } from '../types'

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
