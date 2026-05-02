import { describe, expect, it } from 'vitest'
import {
  validateCollectionForm,
  validateExpenseInvoiceForm,
  validateSalesInvoiceForm,
  validateSupplierPaymentForm,
} from './formValidation'

describe('validateSalesInvoiceForm', () => {
  it('gecerli formda hata donmez', () => {
    const error = validateSalesInvoiceForm({
      customer: 'MUSTERI-001',
      itemCode: 'URUN-001',
      qty: 1,
      rate: 100,
    })

    expect(error).toBeNull()
  })

  it('zorunlu alan eksiginde hata doner', () => {
    const error = validateSalesInvoiceForm({
      customer: '',
      itemCode: 'URUN-001',
      qty: 1,
      rate: 100,
    })

    expect(error).toBe('Lutfen musteri, urun, miktar ve fiyat alanlarini doldurun.')
  })
})

describe('validateCollectionForm', () => {
  it('gecerli formda hata donmez', () => {
    const error = validateCollectionForm({
      party: 'MUSTERI-001',
      referenceInvoice: 'SINV-0001',
      paidAmount: 250,
      modeOfPayment: 'Nakit',
    })

    expect(error).toBeNull()
  })

  it('acik fatura eksiginde hata doner', () => {
    const error = validateCollectionForm({
      party: 'MUSTERI-001',
      referenceInvoice: '',
      paidAmount: 250,
      modeOfPayment: 'Nakit',
    })

    expect(error).toBe('Lutfen musteri, acik fatura, odeme yontemi ve tahsilat tutarini girin.')
  })
})

describe('validateExpenseInvoiceForm', () => {
  it('gecerli formda hata donmez', () => {
    const error = validateExpenseInvoiceForm({
      supplier: 'TEDARIKCI-001',
      itemCode: 'GIDER-001',
      qty: 1,
      rate: 150,
    })

    expect(error).toBeNull()
  })

  it('miktar sifirsa hata doner', () => {
    const error = validateExpenseInvoiceForm({
      supplier: 'TEDARIKCI-001',
      itemCode: 'GIDER-001',
      qty: 0,
      rate: 150,
    })

    expect(error).toBe('Lutfen alis faturasi alanlarini doldurun.')
  })
})

describe('validateSupplierPaymentForm', () => {
  it('gecerli formda hata donmez', () => {
    const error = validateSupplierPaymentForm({
      supplier: 'TEDARIKCI-001',
      paidAmount: 300,
      modeOfPayment: 'Banka Havalesi',
    })

    expect(error).toBeNull()
  })

  it('odeme yontemi bos ise hata doner', () => {
    const error = validateSupplierPaymentForm({
      supplier: 'TEDARIKCI-001',
      paidAmount: 300,
      modeOfPayment: '',
    })

    expect(error).toBe('Lutfen odeme alanlarini doldurun.')
  })
})
