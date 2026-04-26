export type StockFilterState = {
  itemGroup: string;
  searchText: string;
  criticalOnly: boolean;
};

export type StockCardTone = "neutral" | "warning" | "critical";
export type StockRiskLevel = "unknown" | "normal" | "warning" | "critical";

export type StockItem = {
  id: string;
  itemCode: string;
  itemName: string;
  itemGroup: string;
  barcode: string | null;
  secondaryAisle: string | null;
  isCritical: boolean;
  riskLevel: StockRiskLevel;
  stockQtyLabel: string;
  stockQtyValue: number | null;
  tone: StockCardTone;
};

export type StockSummary = {
  totalItems: number;
  totalCriticalItems: number;
  noStockItems: number;
  withBarcodeItems: number;
  totalWarehouses: number;
  totalStockQtyLabel: string;
};

export type StockWarehouseDistribution = {
  warehouse: string;
  totalQty: number;
  totalQtyLabel: string;
  itemCount: number;
  criticalItemCount: number;
  sharePercent: number;
};

export type StockData = {
  items: StockItem[];
  summary: StockSummary;
  warehouseDistribution: StockWarehouseDistribution[];
  itemGroupOptions: string[];
  hasCriticalField: boolean;
};

export type StockCreateInput = {
  itemCode: string;
  itemName: string;
  itemGroup: string;
  barcode?: string;
  description?: string;
  unit?: string;
  isStockItem?: boolean;
  isCriticalStock?: boolean;
};

export type StockCreateOptions = {
  itemGroups: string[];
  uoms: string[];
};

export type StockMaterialRequestCreateInput = {
  itemCode: string;
  qty: number;
  scheduleDate: string;
  warehouse: string | null;
  note?: string;
};

export type StockMaterialRequestCreateOptions = {
  canCreate: boolean;
  warehouses: string[];
};
