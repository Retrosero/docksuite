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

export type StockTransferCreateInput = {
  itemCode: string;
  qty: number;
  postingDate: string;
  sourceWarehouse: string;
  targetWarehouse: string;
  note?: string;
};

export type StockTransferCreateOptions = {
  canCreate: boolean;
  warehouses: string[];
};

export type StockReconciliationAnalysisRow = {
  reconciliationId: string;
  postingDate: string;
  itemCode: string;
  warehouse: string;
  currentQty: number;
  currentQtyLabel: string;
  countedQty: number;
  countedQtyLabel: string;
  qtyDifference: number;
  qtyDifferenceLabel: string;
  docStatusLabel: string;
};

export type StockReconciliationAnalysis = {
  canRead: boolean;
  totalRows: number;
  totalAbsDifferenceLabel: string;
  criticalDifferenceCount: number;
  warehouseCount: number;
  statusSummary: Array<{
    label: string;
    count: number;
  }>;
  rows: StockReconciliationAnalysisRow[];
};

export type StockAuditEventRow = {
  doctype: string;
  documentId: string;
  actor: string;
  stateLabel: string;
  stateTone: "open" | "closed";
  docStatusLabel: string;
  statusLabel: string;
  postingDate: string;
  updatedAt: string;
};

export type StockAuditSummary = {
  canRead: boolean;
  totalEvents: number;
  openEvents: number;
  closedEvents: number;
  uniqueActors: number;
  doctypeSummary: Array<{
    label: string;
    count: number;
  }>;
  rows: StockAuditEventRow[];
};

export type StockProcurementLinkRow = {
  itemCode: string;
  itemName: string;
  openMaterialRequestCount: number;
  openPurchaseOrderCount: number;
  purchaseReceiptCount: number;
  lastPurchaseInvoiceId: string | null;
  lastPurchaseInvoiceDate: string | null;
};

export type StockProcurementLinkSummary = {
  canRead: boolean;
  totalTrackedItems: number;
  totalOpenMaterialRequests: number;
  totalOpenPurchaseOrders: number;
  totalReceipts: number;
  rows: StockProcurementLinkRow[];
};

export type StockReconciliationCreateInput = {
  itemCode: string;
  warehouse: string;
  countedQty: number;
  postingDate: string;
  note?: string;
};

export type StockReconciliationCreateOptions = {
  canCreate: boolean;
  warehouses: string[];
};
