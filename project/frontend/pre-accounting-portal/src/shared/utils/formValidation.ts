import type { PaymentEntryForm } from '../../features/collections/types'
import type { CashBankTransferDraft } from '../../features/cash-bank/types'
import type { SupplierForm } from '../../features/cari/types'
import type { CustomerForm } from '../../features/customers/types'
import type { ExpenseForm, SupplierPaymentForm } from '../../features/expense/types'
import type { ProductForm } from '../../features/products/types'
import type { SalesInvoiceForm, SalesQuotationForm } from '../../features/sales-invoice/types'

export function validateSalesInvoiceForm(form: SalesInvoiceForm): string | null {
  if (!form.customer || !form.itemCode || form.qty <= 0 || form.rate <= 0) {
    return 'Lütfen müşteri, ürün, miktar ve fiyat alanlarını doldurun.'
  }
  return null
}

export function validateSalesQuotationForm(form: SalesQuotationForm): string | null {
  if (!form.customer || !form.itemCode || form.qty <= 0 || form.rate <= 0 || !form.validTill) {
    return 'Lütfen teklif için müşteri, ürün, miktar, fiyat ve geçerlilik tarihini doldurun.'
  }
  return null
}

export function validateCollectionForm(form: PaymentEntryForm): string | null {
  if (!form.party || form.paidAmount <= 0 || !form.modeOfPayment || !form.referenceInvoice) {
    return 'Lütfen müşteri, açık fatura, ödeme yöntemi ve tahsilat tutarını girin.'
  }
  return null
}

export function validateCustomerForm(form: CustomerForm): string | null {
  if (!form.customerName.trim() || !form.customerType || !form.customerGroup || !form.territory) {
    return 'Lütfen müşteri adı, müşteri tipi, müşteri grubu ve bölge alanlarını doldurun.'
  }
  return null
}

export function validateProductForm(form: ProductForm): string | null {
  if (!form.itemCode.trim() || !form.itemName.trim() || !form.itemGroup || !form.stockUom) {
    return 'Lütfen ürün kodu, ürün adı, ürün grubu ve stok birimi alanlarını doldurun.'
  }
  return null
}

export function validateSupplierForm(form: SupplierForm): string | null {
  if (!form.supplierName.trim() || !form.supplierType || !form.supplierGroup) {
    return 'Lütfen tedarikçi adı, tedarikçi tipi ve tedarikçi grubu alanlarını doldurun.'
  }
  return null
}

export function validateExpenseInvoiceForm(form: ExpenseForm): string | null {
  if (!form.supplier || !form.itemCode || form.qty <= 0 || form.rate <= 0) {
    return 'Lütfen alış faturası alanlarını doldurun.'
  }
  return null
}

export function validateSupplierPaymentForm(form: SupplierPaymentForm): string | null {
  if (!form.supplier || form.paidAmount <= 0 || !form.modeOfPayment) {
    return 'Lütfen ödeme alanlarını doldurun.'
  }
  return null
}

export function validateCashBankTransferForm(form: CashBankTransferDraft): string | null {
  if (!form.paid_from || !form.paid_to || !form.posting_date || form.paid_amount <= 0 || !form.company) {
    return 'Lütfen transfer için kaynak, hedef, tarih, tutar ve şirket alanlarını doldurun.'
  }

  if (form.paid_from === form.paid_to) {
    return 'Kaynak ve hedef hesap aynı olamaz.'
  }

  return null
}
