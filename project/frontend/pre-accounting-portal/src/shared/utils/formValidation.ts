import type { PaymentEntryForm } from '../../features/collections/types'
import type { ExpenseForm, SupplierPaymentForm } from '../../features/expense/types'
import type { SalesInvoiceForm } from '../../features/sales-invoice/types'

export function validateSalesInvoiceForm(form: SalesInvoiceForm): string | null {
  if (!form.customer || !form.itemCode || form.qty <= 0 || form.rate <= 0) {
    return 'Lütfen müşteri, ürün, miktar ve fiyat alanlarını doldurun.'
  }
  return null
}

export function validateCollectionForm(form: PaymentEntryForm): string | null {
  if (!form.party || form.paidAmount <= 0 || !form.modeOfPayment || !form.referenceInvoice) {
    return 'Lütfen müşteri, açık fatura, ödeme yöntemi ve tahsilat tutarını girin.'
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
