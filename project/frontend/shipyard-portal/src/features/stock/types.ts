export type StockFilterState = {
  itemGroup: string;
  searchText: string;
  criticalOnly: boolean;
};

export type StockCardTone = "neutral" | "critical";

export type StockItem = {
  id: string;
  itemCode: string;
  itemName: string;
  itemGroup: string;
  barcode: string | null;
  secondaryAisle: string | null;
  isCritical: boolean;
  stockQtyLabel: string;
  stockQtyValue: number | null;
  tone: StockCardTone;
};

export type StockSummary = {
  totalItems: number;
  totalCriticalItems: number;
  noStockItems: number;
  withBarcodeItems: number;
};

export type StockData = {
  items: StockItem[];
  summary: StockSummary;
  itemGroupOptions: string[];
  hasCriticalField: boolean;
};
