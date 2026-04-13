export type PurchaseInvoiceFilterState = {
  supplier: string;
  startDate: string;
  endDate: string;
  searchText: string;
};

export type PurchaseInvoicePaymentTone = "positive" | "warning" | "negative";

export type PurchaseInvoiceListItem = {
  id: string;
  invoiceNo: string;
  supplier: string;
  postingDateLabel: string;
  dueDateLabel: string;
  company: string;
  grandTotal: number;
  grandTotalLabel: string;
  outstandingAmount: number;
  outstandingAmountLabel: string;
  paymentStatusLabel: string;
  paymentStatusTone: PurchaseInvoicePaymentTone;
};

export type PurchaseInvoiceSummary = {
  totalCount: number;
  totalGrandAmount: number;
  totalGrandAmountLabel: string;
  totalOutstandingAmount: number;
  totalOutstandingAmountLabel: string;
};

export type PurchaseInvoiceListData = {
  items: PurchaseInvoiceListItem[];
  supplierOptions: string[];
  summary: PurchaseInvoiceSummary;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

export type PurchaseInvoiceDetailItem = {
  id: string;
  itemCode: string;
  itemName: string;
  qtyLabel: string;
  amountLabel: string;
};

export type PurchaseInvoiceDetailData = {
  invoiceNo: string;
  supplier: string;
  postingDateLabel: string;
  dueDateLabel: string;
  company: string;
  status: string;
  remarks: string | null;
  grandTotalLabel: string;
  outstandingAmountLabel: string;
  paymentStatusLabel: string;
  paymentStatusTone: PurchaseInvoicePaymentTone;
  items: PurchaseInvoiceDetailItem[];
};
