import type { CashBankTransferDraft } from '../../features/cash-bank/types'
import type { PaymentEntryForm } from '../../features/collections/types'
import type { SupplierForm } from '../../features/cari/types'
import type { CustomerForm } from '../../features/customers/types'
import type { ExpenseForm, SupplierPaymentForm } from '../../features/expense/types'
import type { ProductForm } from '../../features/products/types'
import type { SalesInvoiceForm, SalesQuotationForm } from '../../features/sales-invoice/types'

export function validateSalesInvoiceForm(form: SalesInvoiceForm): string | null {
  if (!form.customer || form.items.length === 0) {
    return 'Lutfen musteri secin ve sepete en az bir urun ekleyin.'
  }
  const invalidItem = form.items.some(
    (item) => !item.itemCode || item.qty <= 0 || item.rate <= 0 || item.discountPercent < 0 || item.discountPercent > 100,
  )
  if (invalidItem) {
    return 'Sepetteki urun satirlarinda miktar, fiyat ve iskonto bilgilerini kontrol edin.'
  }
  if (!form.paymentType) {
    return 'Odeme tipini secin.'
  }
  if (form.paymentType !== 'Vadeli' && !form.modeOfPayment) {
    return 'Secilen odeme tipi icin ERP odeme yontemi eslestirin.'
  }
  return null
}

export function validateSalesQuotationForm(form: SalesQuotationForm): string | null {
  if (!form.customer || !form.itemCode || form.qty <= 0 || form.rate <= 0 || !form.validTill) {
    return 'Lutfen teklif icin musteri, urun, miktar, fiyat ve gecerlilik tarihini doldurun.'
  }
  return null
}

export function validateCollectionForm(form: PaymentEntryForm): string | null {
  if (!form.party || form.paidAmount <= 0 || !form.modeOfPayment || !form.referenceInvoice) {
    return 'Lutfen musteri, acik fatura, odeme yontemi ve tahsilat tutarini girin.'
  }
  return null
}

export function validateCustomerForm(form: CustomerForm): string | null {
  if (!form.customerName.trim() || !form.customerType || !form.customerGroup || !form.territory) {
    return 'Lutfen musteri adi, musteri tipi, musteri grubu ve bolge alanlarini doldurun.'
  }
  return null
}

export function validateProductForm(form: ProductForm): string | null {
  if (!form.itemCode.trim() || !form.itemName.trim() || !form.itemGroup || !form.stockUom) {
    return 'Lutfen urun kodu, urun adi, urun grubu ve stok birimi alanlarini doldurun.'
  }
  return null
}

export function validateSupplierForm(form: SupplierForm): string | null {
  if (!form.supplierName.trim() || !form.supplierType || !form.supplierGroup) {
    return 'Lutfen tedarikci adi, tedarikci tipi ve tedarikci grubu alanlarini doldurun.'
  }
  return null
}

export function validateExpenseInvoiceForm(form: ExpenseForm): string | null {
  if (!form.supplier || !form.itemCode || form.qty <= 0 || form.rate <= 0) {
    return 'Lutfen alis faturasi alanlarini doldurun.'
  }
  return null
}

export function validateSupplierPaymentForm(form: SupplierPaymentForm): string | null {
  if (!form.supplier || form.paidAmount <= 0 || !form.modeOfPayment) {
    return 'Lutfen odeme alanlarini doldurun.'
  }
  return null
}

export function validateCashBankTransferForm(form: CashBankTransferDraft): string | null {
  if (!form.paid_from || !form.paid_to || !form.posting_date || form.paid_amount <= 0 || !form.company) {
    return 'Lutfen transfer icin kaynak, hedef, tarih, tutar ve sirket alanlarini doldurun.'
  }
  if (form.paid_from === form.paid_to) {
    return 'Kaynak ve hedef hesap ayni olamaz.'
  }
  return null
}
