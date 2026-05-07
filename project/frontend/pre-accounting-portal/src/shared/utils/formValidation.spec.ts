import { describe, expect, it } from 'vitest'
import {
  validateCashBankTransferForm,
  validateCollectionForm,
  validateCustomerForm,
  validateExpenseInvoiceForm,
  validateProductForm,
  validateSalesInvoiceForm,
  validateSalesQuotationForm,
  validateSupplierForm,
  validateSupplierPaymentForm,
} from './formValidation'

describe('validateSalesInvoiceForm', () => {
  it('gecerli formda hata donmez', () => {
    expect(
      validateSalesInvoiceForm({
        customer: 'MUSTERI-001',
        items: [{ itemCode: 'URUN-001', qty: 1, rate: 100, discountPercent: 0 }],
        paymentType: 'Nakit',
      }),
    ).toBeNull()
  })
})

describe('validateSalesQuotationForm', () => {
  it('gecerli teklif formunda hata donmez', () => {
    expect(validateSalesQuotationForm({ customer: 'MUSTERI-001', itemCode: 'URUN-001', qty: 2, rate: 125, validTill: '2026-05-15' })).toBeNull()
  })
})

describe('other validators', () => {
  it('collection', () => {
    expect(validateCollectionForm({ party: 'MUSTERI-001', referenceInvoice: 'SINV-0001', paidAmount: 250, modeOfPayment: 'Nakit' })).toBeNull()
  })
  it('customer', () => {
    expect(validateCustomerForm({ customerName: 'Yeni Musteri', customerType: 'Company', customerGroup: 'Ticari', territory: 'Turkiye' })).toBeNull()
  })
  it('product', () => {
    expect(validateProductForm({ itemCode: 'URUN-001', itemName: 'Yeni Urun', itemGroup: 'Urunler', stockUom: 'Adet', isStockItem: true })).toBeNull()
  })
  it('supplier', () => {
    expect(validateSupplierForm({ supplierName: 'Yeni Tedarikci', supplierType: 'Company', supplierGroup: 'Tedarikciler' })).toBeNull()
  })
  it('expense invoice', () => {
    expect(validateExpenseInvoiceForm({ supplier: 'TEDARIKCI-001', itemCode: 'GIDER-001', qty: 1, rate: 150 })).toBeNull()
  })
  it('supplier payment', () => {
    expect(validateSupplierPaymentForm({ supplier: 'TEDARIKCI-001', paidAmount: 300, modeOfPayment: 'Banka Havalesi' })).toBeNull()
  })
  it('cash bank transfer', () => {
    expect(validateCashBankTransferForm({ posting_date: '2026-05-03', paid_from: '100.01', paid_to: '102.01', paid_amount: 1000, company: 'Demo Sirket' })).toBeNull()
  })
})
