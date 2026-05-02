import type { PaymentEntryForm } from '../../features/collections/types'
import type { ExpenseForm, SupplierPaymentForm } from '../../features/expense/types'
import type { SalesInvoiceForm } from '../../features/sales-invoice/types'

export function validateSalesInvoiceForm(form: SalesInvoiceForm): string | null {
  if (!form.customer || !form.itemCode || form.qty <= 0 || form.rate <= 0) {
    return 'Lutfen musteri, urun, miktar ve fiyat alanlarini doldurun.'
  }
  return null
}

export function validateCollectionForm(form: PaymentEntryForm): string | null {
  if (!form.party || form.paidAmount <= 0 || !form.modeOfPayment || !form.referenceInvoice) {
    return 'Lutfen musteri, acik fatura, odeme yontemi ve tahsilat tutarini girin.'
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
