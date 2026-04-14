export interface TenantScopedRequest {
  tenantId: string;
}

export interface BootstrapSummaryContract {
  customerCount: number;
  itemCount: number;
  draftOrderCount: number;
}

export interface BootstrapResponseContract {
  summary: BootstrapSummaryContract;
}

export interface CustomerContract {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  city: string | null;
  balance: string | null;
  creditLimit: string | null;
}

export interface CustomersResponseContract {
  customers: CustomerContract[];
}

export interface ItemPriceContract {
  priceList: string;
  currency: string;
  unitPrice: string;
}

export interface ItemContract {
  id: string;
  itemCode: string;
  name: string;
  barcode: string | null;
  stockSnapshot: string | null;
  prices: ItemPriceContract[];
}

export interface ItemsResponseContract {
  items: ItemContract[];
}
