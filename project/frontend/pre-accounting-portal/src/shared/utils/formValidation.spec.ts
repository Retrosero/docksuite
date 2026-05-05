import { describe, expect, it } from 'vitest'
import {
  validateCashBankTransferForm,
  validateCollectionForm,
  validateCustomerForm,
  validateExpenseInvoiceForm,
  validateProductForm,
  validateSalesInvoiceForm,
  validateSalesQuotationForm,
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

    expect(error).toBe('Lütfen müşteri, ürün, miktar ve fiyat alanlarını doldurun.')
  })
})

describe('validateSalesQuotationForm', () => {
  it('gecerli teklif formunda hata donmez', () => {
    const error = validateSalesQuotationForm({
      customer: 'MUSTERI-001',
      itemCode: 'URUN-001',
      qty: 2,
      rate: 125,
      validTill: '2026-05-15',
    })

    expect(error).toBeNull()
  })

  it('gecerlilik tarihi eksiginde hata doner', () => {
    const error = validateSalesQuotationForm({
      customer: 'MUSTERI-001',
      itemCode: 'URUN-001',
      qty: 2,
      rate: 125,
      validTill: '',
    })

    expect(error).toBe('Lütfen teklif için müşteri, ürün, miktar, fiyat ve geçerlilik tarihini doldurun.')
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

    expect(error).toBe('Lütfen müşteri, açık fatura, ödeme yöntemi ve tahsilat tutarını girin.')
  })
})

describe('validateCustomerForm', () => {
  it('gecerli musteri formunda hata donmez', () => {
    const error = validateCustomerForm({
      customerName: 'Yeni Musteri',
      customerType: 'Company',
      customerGroup: 'Ticari',
      territory: 'Turkiye',
    })

    expect(error).toBeNull()
  })

  it('musteri adi eksiginde hata doner', () => {
    const error = validateCustomerForm({
      customerName: '',
      customerType: 'Company',
      customerGroup: 'Ticari',
      territory: 'Turkiye',
    })

    expect(error).toBe('Lütfen müşteri adı, müşteri tipi, müşteri grubu ve bölge alanlarını doldurun.')
  })
})

describe('validateProductForm', () => {
  it('gecerli urun formunda hata donmez', () => {
    const error = validateProductForm({
      itemCode: 'URUN-001',
      itemName: 'Yeni Urun',
      itemGroup: 'Urunler',
      stockUom: 'Adet',
      isStockItem: true,
    })

    expect(error).toBeNull()
  })

  it('urun kodu eksiginde hata doner', () => {
    const error = validateProductForm({
      itemCode: '',
      itemName: 'Yeni Urun',
      itemGroup: 'Urunler',
      stockUom: 'Adet',
      isStockItem: true,
    })

    expect(error).toBe('Lütfen ürün kodu, ürün adı, ürün grubu ve stok birimi alanlarını doldurun.')
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

    expect(error).toBe('Lütfen alış faturası alanlarını doldurun.')
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

    expect(error).toBe('Lütfen ödeme alanlarını doldurun.')
  })
})

describe('validateCashBankTransferForm', () => {
  it('gecerli formda hata donmez', () => {
    const error = validateCashBankTransferForm({
      posting_date: '2026-05-03',
      paid_from: '100.01',
      paid_to: '102.01',
      paid_amount: 1000,
      company: 'Demo Sirket',
    })

    expect(error).toBeNull()
  })

  it('kaynak ve hedef ayniysa hata doner', () => {
    const error = validateCashBankTransferForm({
      posting_date: '2026-05-03',
      paid_from: '100.01',
      paid_to: '100.01',
      paid_amount: 1000,
      company: 'Demo Sirket',
    })

    expect(error).toBe('Kaynak ve hedef hesap aynı olamaz.')
  })

  it('zorunlu alan eksiginde hata doner', () => {
    const error = validateCashBankTransferForm({
      posting_date: '',
      paid_from: '100.01',
      paid_to: '102.01',
      paid_amount: 1000,
      company: 'Demo Sirket',
    })

    expect(error).toBe('Lütfen transfer için kaynak, hedef, tarih, tutar ve şirket alanlarını doldurun.')
  })
})
