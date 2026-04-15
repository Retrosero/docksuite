// Zimmet feature type definitions

export type ZimmetReturnStatus = "Teslim Edildi" | "Kismi Iade" | "Tam Iade";

export type ZimmetItem = {
  id: string;
  name: string;
  employee: string;
  employeeName: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  status: ZimmetReturnStatus;
  deliveryDate?: string;
  returnDate?: string;
  notes?: string;
};

export type ZimmetFilterState = {
  status: string;
  searchText: string;
};

export type ZimmetSummary = {
  total: number;
  delivered: number;
  returned: number;
  pending: number;
};

export type ZimmetData = {
  items: ZimmetItem[];
  summary: ZimmetSummary;
  statusOptions: string[];
};

export type ZimmetApiRow = {
  name?: string;
  employee?: string;
  item?: string;
  quantity?: number;
  return_status?: string;
  delivery_date?: string;
  return_date?: string;
  note?: string;
};

export type FrappeListResponse<T> = {
  data?: T[];
};

export type ZimmetCreateInput = {
  employee: string;
  item: string;
  quantity: number;
  returnStatus?: ZimmetReturnStatus;
  deliveryDate: string;
  notes?: string;
};

export type ZimmetCreateOptions = {
  employeeOptions: string[];
  itemOptions: string[];
};