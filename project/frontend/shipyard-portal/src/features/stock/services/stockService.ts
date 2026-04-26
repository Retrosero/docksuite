import { tenantConfig } from "../../../config/tenant";
import { canReadDoctype, requestErpJson, postErpDoc } from "../../../lib/erpApi";
import type {
  StockCreateInput,
  StockCreateOptions,
  StockData,
  StockFilterState,
  StockItem,
  StockMaterialRequestCreateInput,
  StockMaterialRequestCreateOptions,
  StockTransferCreateInput,
  StockTransferCreateOptions,
  StockSummary,
  StockWarehouseDistribution
} from "../types";
import { resolveStockRisk } from "./stockRisk";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
};

type ResourceListOptions = {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
};

type FrappeListResponse<T> = {
  data?: T[];
};

type FrappeMethodResponse<T> = {
  message?: T;
};

type OperationalSettingsMessage = {
  stock_list_page_size?: number;
  dashboard_critical_stock_limit?: number;
};

type FrappeMetaField = {
  fieldname?: string;
};

type FrappeDoctypeMeta = {
  fields?: FrappeMetaField[];
};

type ItemRow = {
  name?: string;
  item_code?: string;
  item_name?: string;
  item_group?: string;
  barcode?: string;
  shipyard_secondary_aisle?: string;
  is_critical_stock?: number | string | null;
};

type ItemGroupRow = {
  name?: string;
  is_group?: number | null;
};

type UomRow = {
  name?: string;
  enabled?: number | null;
};

type WarehouseRow = {
  name?: string;
  is_group?: number | null;
  disabled?: number | null;
};

type BinRow = {
  item_code?: string;
  warehouse?: string;
  actual_qty?: number | null;
};

type FrappeInsertMessage = {
  name?: string;
};

const REQUEST_TIMEOUT_MS = 9000;
const DEFAULT_LIMIT = 250;
let cachedStockListPageSize: number | null = null;
let cachedCriticalStockLimit: number | null = null;

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function buildApiUrl(path: string, params?: URLSearchParams) {
  const baseUrl = trimTrailingSlash(tenantConfig.erpApiBaseUrl);
  const query = params?.toString();
  return `${baseUrl}${path}${query ? `?${query}` : ""}`;
}

async function requestJson<T>(path: string, params?: URLSearchParams, options: RequestOptions = {}): Promise<T> {
  return requestErpJson<T>(path, params, {
    method: options.method ?? "GET",
    body: options.body,
    timeoutMs: REQUEST_TIMEOUT_MS
  });
}

async function requestResourceList<T>(doctype: string, options: ResourceListOptions): Promise<T[]> {
  const params = new URLSearchParams();
  params.set("fields", JSON.stringify(options.fields));
  params.set("limit_page_length", String(options.limit ?? DEFAULT_LIMIT));

  if (options.filters && options.filters.length > 0) {
    params.set("filters", JSON.stringify(options.filters));
  }

  if (options.orderBy) {
    params.set("order_by", options.orderBy);
  }

  const encodedDoctype = encodeURIComponent(doctype);
  const payload = await requestJson<FrappeListResponse<T>>(`/resource/${encodedDoctype}`, params);
  return payload.data ?? [];
}

async function resolveStockListPageSize() {
  if (cachedStockListPageSize) {
    return cachedStockListPageSize;
  }

  try {
    const payload = await requestJson<FrappeMethodResponse<OperationalSettingsMessage>>(
      "/method/shipyard_app.platform.api.get_operational_settings"
    );
    const resolved = Number(payload.message?.stock_list_page_size ?? DEFAULT_LIMIT);
    cachedStockListPageSize = Number.isFinite(resolved) ? Math.max(50, Math.min(1000, Math.floor(resolved))) : DEFAULT_LIMIT;
    return cachedStockListPageSize;
  } catch {
    cachedStockListPageSize = DEFAULT_LIMIT;
    return cachedStockListPageSize;
  }
}

async function resolveCriticalStockLimit() {
  if (cachedCriticalStockLimit) {
    return cachedCriticalStockLimit;
  }

  try {
    const payload = await requestJson<FrappeMethodResponse<OperationalSettingsMessage>>(
      "/method/shipyard_app.platform.api.get_operational_settings"
    );
    const resolved = Number(payload.message?.dashboard_critical_stock_limit ?? 5);
    cachedCriticalStockLimit = Number.isFinite(resolved) ? Math.max(1, Math.min(200, Math.floor(resolved))) : 5;
    return cachedCriticalStockLimit;
  } catch {
    cachedCriticalStockLimit = 5;
    return cachedCriticalStockLimit;
  }
}

async function getDoctypeFieldSet(doctype: string) {
  const params = new URLSearchParams();
  params.set("doctype", doctype);

  let payload: FrappeMethodResponse<FrappeDoctypeMeta>;
  try {
    payload = await requestJson<FrappeMethodResponse<FrappeDoctypeMeta>>(
      "/method/frappe.client.get_meta",
      params
    );
  } catch {
    return new Set<string>();
  }

  const fields = payload.message?.fields ?? [];
  return new Set(fields.map((row) => row.fieldname ?? "").filter((row) => row.length > 0));
}

function toNumber(value: number | null | undefined) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function toBoolFromCheck(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }

  return false;
}

function isFieldNotPermittedInQuery(error: unknown, fieldName: string) {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.toLowerCase().includes(`field not permitted in query: ${fieldName.toLowerCase()}`);
}

function buildStockQtyMap(rows: BinRow[]) {
  const quantityByItem = new Map<string, number>();

  for (const row of rows) {
    const itemCode = row.item_code?.trim();
    if (!itemCode) {
      continue;
    }

    const current = quantityByItem.get(itemCode) ?? 0;
    quantityByItem.set(itemCode, current + toNumber(row.actual_qty));
  }

  return quantityByItem;
}

function formatQtyLabel(value: number) {
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(value)} adet`;
}

function toStockItemRows(
  rows: ItemRow[],
  qtyMap: Map<string, number>,
  hasCriticalField: boolean,
  criticalStockLimit: number
): StockItem[] {
  return rows.map((row) => {
    const itemCode = row.item_code?.trim() || row.name || "-";
    const stockQtyValue = qtyMap.has(itemCode) ? qtyMap.get(itemCode) ?? 0 : null;
    const stockQtyLabel = stockQtyValue === null ? "Stok bilgisi yok" : formatQtyLabel(stockQtyValue);
    const criticalByField = hasCriticalField ? toBoolFromCheck(row.is_critical_stock) : false;
    const risk = resolveStockRisk({
      stockQtyValue,
      hasCriticalField,
      criticalByField,
      criticalStockLimit
    });

    return {
      id: row.name ?? itemCode,
      itemCode,
      itemName: row.item_name?.trim() || itemCode,
      itemGroup: row.item_group?.trim() || "Grup belirtilmedi",
      barcode: row.barcode?.trim() || null,
      secondaryAisle: row.shipyard_secondary_aisle?.trim() || null,
      isCritical: risk.isCritical,
      riskLevel: risk.riskLevel,
      stockQtyLabel,
      stockQtyValue,
      tone: risk.tone
    };
  });
}

function applySearch(items: StockItem[], searchText: string) {
  const normalizedSearch = searchText.trim().toLowerCase();

  if (!normalizedSearch) {
    return items;
  }

  return items.filter((row) => {
    return (
      row.itemCode.toLowerCase().includes(normalizedSearch) ||
      row.itemName.toLowerCase().includes(normalizedSearch) ||
      row.itemGroup.toLowerCase().includes(normalizedSearch) ||
      (row.barcode ?? "").toLowerCase().includes(normalizedSearch) ||
      (row.secondaryAisle ?? "").toLowerCase().includes(normalizedSearch)
    );
  });
}

function buildWarehouseDistribution(rows: BinRow[], items: StockItem[]): StockWarehouseDistribution[] {
  if (rows.length === 0 || items.length === 0) {
    return [];
  }

  const visibleByCode = new Map(items.map((row) => [row.itemCode, row]));
  const grouped = new Map<
    string,
    {
      totalQty: number;
      itemCodes: Set<string>;
      criticalCodes: Set<string>;
    }
  >();

  for (const row of rows) {
    const itemCode = row.item_code?.trim();
    const warehouse = row.warehouse?.trim() || "Depo belirtilmedi";

    if (!itemCode || !visibleByCode.has(itemCode)) {
      continue;
    }

    const qty = toNumber(row.actual_qty);
    if (qty === 0) {
      continue;
    }

    const current = grouped.get(warehouse) ?? {
      totalQty: 0,
      itemCodes: new Set<string>(),
      criticalCodes: new Set<string>()
    };
    current.totalQty += qty;
    current.itemCodes.add(itemCode);

    if (visibleByCode.get(itemCode)?.isCritical) {
      current.criticalCodes.add(itemCode);
    }

    grouped.set(warehouse, current);
  }

  const totalPositiveQty = [...grouped.values()].reduce((acc, row) => acc + Math.max(0, row.totalQty), 0);

  return [...grouped.entries()]
    .map(([warehouse, row]) => {
      const positiveQty = Math.max(0, row.totalQty);
      const sharePercent = totalPositiveQty > 0 ? Math.round((positiveQty / totalPositiveQty) * 100) : 0;

      return {
        warehouse,
        totalQty: row.totalQty,
        totalQtyLabel: formatQtyLabel(row.totalQty),
        itemCount: row.itemCodes.size,
        criticalItemCount: row.criticalCodes.size,
        sharePercent
      };
    })
    .sort((a, b) => {
      if (a.totalQty !== b.totalQty) {
        return b.totalQty - a.totalQty;
      }
      return a.warehouse.localeCompare(b.warehouse, "tr");
    });
}

function buildSummary(items: StockItem[], warehouseDistribution: StockWarehouseDistribution[]): StockSummary {
  const totalStockQty = items.reduce((acc, row) => acc + (row.stockQtyValue ?? 0), 0);

  return {
    totalItems: items.length,
    totalCriticalItems: items.filter((row) => row.isCritical).length,
    noStockItems: items.filter((row) => row.stockQtyValue !== null && row.stockQtyValue <= 0).length,
    withBarcodeItems: items.filter((row) => (row.barcode ?? "").length > 0).length,
    totalWarehouses: warehouseDistribution.length,
    totalStockQtyLabel: formatQtyLabel(totalStockQty)
  };
}

function applyCriticalOnly(items: StockItem[], criticalOnly: boolean) {
  if (!criticalOnly) {
    return items;
  }
  return items.filter((row) => row.isCritical);
}

function sortByCriticalAndName(items: StockItem[]) {
  return [...items].sort((a, b) => {
    if (a.isCritical !== b.isCritical) {
      return a.isCritical ? -1 : 1;
    }

    return a.itemName.localeCompare(b.itemName, "tr");
  });
}

function sortItemGroups(items: StockItem[]) {
  const groups = new Set<string>();

  for (const row of items) {
    if (row.itemGroup.trim().length > 0) {
      groups.add(row.itemGroup);
    }
  }

  return [...groups].sort((a, b) => a.localeCompare(b, "tr"));
}

function buildItemFilters(filters: StockFilterState, hasCriticalField: boolean) {
  const next: unknown[] = [
    ["disabled", "=", 0],
    ["is_stock_item", "=", 1]
  ];

  if (filters.itemGroup.trim().length > 0) {
    next.push(["item_group", "=", filters.itemGroup.trim()]);
  }

  if (filters.criticalOnly && hasCriticalField) {
    next.push(["is_critical_stock", "=", 1]);
  }

  return next;
}

async function fetchStockBins(itemCodes: string[], pageSize: number): Promise<BinRow[]> {
  if (itemCodes.length === 0) {
    return [];
  }

  try {
    return await requestResourceList<BinRow>("Bin", {
      fields: ["item_code", "warehouse", "actual_qty"],
      filters: [["item_code", "in", itemCodes]],
      limit: Math.max(itemCodes.length * 3, pageSize)
    });
  } catch {
    return [];
  }
}

async function fetchItemRows(
  fields: string[],
  filters: StockFilterState,
  hasCriticalField: boolean,
  pageSize: number
): Promise<ItemRow[]> {
  const attempts: string[][] = [
    fields,
    fields.filter((field) => field !== "barcode"),
    fields.filter((field) => field !== "shipyard_secondary_aisle"),
    fields.filter((field) => field !== "is_critical_stock"),
    ["name", "item_code", "item_name", "item_group"]
  ];

  const uniqueAttempts: string[][] = [];
  const seenKeys = new Set<string>();
  for (const attempt of attempts) {
    const normalized = [...new Set(attempt)];
    const key = normalized.join("|");
    if (!key || seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    uniqueAttempts.push(normalized);
  }

  for (const attemptFields of uniqueAttempts) {
    try {
      return await requestResourceList<ItemRow>("Item", {
        fields: attemptFields,
        filters: buildItemFilters(filters, hasCriticalField),
        orderBy: "modified desc",
        limit: pageSize
      });
    } catch (error) {
      if (
        isFieldNotPermittedInQuery(error, "barcode") ||
        isFieldNotPermittedInQuery(error, "shipyard_secondary_aisle") ||
        isFieldNotPermittedInQuery(error, "is_critical_stock")
      ) {
        continue;
      }
      throw error;
    }
  }

  return [];
}

export async function fetchStockData(filters: StockFilterState): Promise<StockData> {
  const [canReadItem, canReadBin] = await Promise.all([
    canReadDoctype("Item"),
    canReadDoctype("Bin")
  ]);
  if (!canReadItem) {
    return {
      items: [],
      summary: buildSummary([], []),
      warehouseDistribution: [],
      itemGroupOptions: [],
      hasCriticalField: false
    };
  }

  const [pageSize, criticalStockLimit, itemFieldSet] = await Promise.all([
    resolveStockListPageSize(),
    resolveCriticalStockLimit(),
    getDoctypeFieldSet("Item")
  ]);
  const hasBarcodeField = itemFieldSet.has("barcode");
  const hasSecondaryAisleField = itemFieldSet.has("shipyard_secondary_aisle");
  const hasCriticalField = itemFieldSet.has("is_critical_stock");
  const hasCriticalView = hasCriticalField || canReadBin;

  const fields = ["name", "item_code", "item_name", "item_group"];

  if (hasBarcodeField) {
    fields.push("barcode");
  }

  if (hasSecondaryAisleField) {
    fields.push("shipyard_secondary_aisle");
  }

  if (hasCriticalField) {
    fields.push("is_critical_stock");
  }

  const itemRows = await fetchItemRows(fields, filters, hasCriticalField, pageSize);

  const itemCodes = [...new Set(itemRows.map((row) => row.item_code?.trim() || "").filter((row) => row.length > 0))];
  const binRows = canReadBin ? await fetchStockBins(itemCodes, pageSize) : [];
  const qtyMap = buildStockQtyMap(binRows);

  const mappedRows = toStockItemRows(itemRows, qtyMap, hasCriticalField, criticalStockLimit);
  const searchedRows = applySearch(mappedRows, filters.searchText);
  const criticalRows = applyCriticalOnly(searchedRows, filters.criticalOnly);
  const sortedRows = sortByCriticalAndName(criticalRows);
  const warehouseDistribution = buildWarehouseDistribution(binRows, sortedRows);

  return {
    items: sortedRows,
    summary: buildSummary(sortedRows, warehouseDistribution),
    warehouseDistribution,
    itemGroupOptions: sortItemGroups(mappedRows),
    hasCriticalField: hasCriticalView
  };
}

export async function createStockItem(input: StockCreateInput): Promise<string> {
  const itemFieldSet = await getDoctypeFieldSet("Item");

  const payload: Record<string, unknown> = {
    item_code: input.itemCode.trim(),
    item_name: input.itemName.trim(),
    item_group: input.itemGroup.trim(),
    is_stock_item: input.isStockItem !== false ? 1 : 0,
    stock_uom: input.unit?.trim() || "Nos"
  };

  if (input.barcode?.trim()) {
    payload.barcode = input.barcode.trim();
  }
  if (input.description?.trim()) {
    payload.description = input.description.trim();
  }

  if (input.isCriticalStock && itemFieldSet.has("is_critical_stock")) {
    payload.is_critical_stock = 1;
  }

  const response = await postErpDoc<{ data?: { name?: string } }>(
    "Item",
    null,
    payload
  );

  const itemId = response.data?.name;

  if (!itemId) {
    throw new Error("Stok kaydi olusturuldu ancak kimlik donmedi.");
  }

  return itemId;
}

export async function updateStockItem(itemCode: string, input: StockCreateInput): Promise<string> {
  const itemFieldSet = await getDoctypeFieldSet("Item");

  const payload: Record<string, unknown> = {
    item_code: input.itemCode.trim(),
    item_name: input.itemName.trim(),
    item_group: input.itemGroup.trim(),
    stock_uom: input.unit?.trim() || "Nos"
  };

  if (input.barcode?.trim()) {
    payload.barcode = input.barcode.trim();
  }
  if (input.description?.trim()) {
    payload.description = input.description.trim();
  }

  if (itemFieldSet.has("is_critical_stock")) {
    payload.is_critical_stock = input.isCriticalStock ? 1 : 0;
  }

  const response = await postErpDoc<{ data?: { name?: string } }>(
    "Item",
    itemCode,
    payload
  );

  return response.data?.name ?? itemCode;
}

export async function deleteStockItem(itemCode: string): Promise<string> {
  const params = new URLSearchParams();
  params.set("method", "DELETE");

  await requestErpJson<{ message?: string }>(
    `/resource/Item/${encodeURIComponent(itemCode)}`,
    params,
    { method: "DELETE", timeoutMs: 9000, cacheKeySuffix: null }
  );

  return itemCode;
}

export async function fetchStockCreateOptions(): Promise<StockCreateOptions> {
  const [canReadItemGroup, canReadUom] = await Promise.all([
    canReadDoctype("Item Group"),
    canReadDoctype("UOM")
  ]);
  const [itemGroups, uoms] = await Promise.all([
    canReadItemGroup
      ? requestResourceList<ItemGroupRow>("Item Group", {
          fields: ["name", "is_group"],
          orderBy: "name asc",
          limit: 500
        }).catch(() => [])
      : Promise.resolve([]),
    canReadUom
      ? requestResourceList<UomRow>("UOM", {
          fields: ["name", "enabled"],
          orderBy: "name asc",
          limit: 500
        }).catch(() => [])
      : Promise.resolve([])
  ]);

  return {
    itemGroups: itemGroups
      .filter((row) => Number(row.is_group ?? 0) !== 1)
      .map((row) => row.name ?? "")
      .filter((row) => row.trim().length > 0),
    uoms: uoms
      .filter((row) => Number(row.enabled ?? 1) !== 0)
      .map((row) => row.name ?? "")
      .filter((row) => row.trim().length > 0)
  };
}

function normalizeDateInput(value: string) {
  const trimmed = value.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  return new Date().toISOString().slice(0, 10);
}

export function buildMaterialRequestDoc(input: StockMaterialRequestCreateInput) {
  const qty = Number(input.qty);
  const safeQty = Number.isFinite(qty) ? Math.max(0.01, qty) : 1;
  const scheduleDate = normalizeDateInput(input.scheduleDate);

  const itemRow: Record<string, unknown> = {
    item_code: input.itemCode.trim(),
    qty: safeQty,
    schedule_date: scheduleDate
  };

  if (input.warehouse?.trim()) {
    itemRow.warehouse = input.warehouse.trim();
  }

  return {
    doctype: "Material Request",
    material_request_type: "Purchase",
    transaction_date: scheduleDate,
    schedule_date: scheduleDate,
    items: [itemRow],
    ...(input.note?.trim() ? { notes: input.note.trim() } : {})
  };
}

async function fetchSelectableWarehouses() {
  const canReadWarehouse = await canReadDoctype("Warehouse");
  if (!canReadWarehouse) {
    return [];
  }

  const warehouseRows = await requestResourceList<WarehouseRow>("Warehouse", {
    fields: ["name", "is_group", "disabled"],
    orderBy: "name asc",
    limit: 500
  }).catch(() => []);

  return warehouseRows
    .filter((row) => Number(row.is_group ?? 0) !== 1)
    .filter((row) => Number(row.disabled ?? 0) !== 1)
    .map((row) => row.name ?? "")
    .filter((row) => row.trim().length > 0);
}

export async function fetchStockMaterialRequestCreateOptions(): Promise<StockMaterialRequestCreateOptions> {
  const canReadMaterialRequest = await canReadDoctype("Material Request");

  if (!canReadMaterialRequest) {
    return {
      canCreate: false,
      warehouses: []
    };
  }

  return {
    canCreate: true,
    warehouses: await fetchSelectableWarehouses()
  };
}

export async function createStockMaterialRequest(input: StockMaterialRequestCreateInput): Promise<string> {
  const doc = buildMaterialRequestDoc(input);
  const payload = await requestJson<FrappeMethodResponse<FrappeInsertMessage>>("/method/frappe.client.insert", undefined, {
    method: "POST",
    body: {
      doc: JSON.stringify(doc)
    }
  });
  const requestId = payload.message?.name;

  if (!requestId || requestId.trim().length === 0) {
    throw new Error("Malzeme talebi olusturuldu ancak belge numarasi donmedi.");
  }

  return requestId;
}

export function buildStockTransferDoc(input: StockTransferCreateInput) {
  const qty = Number(input.qty);
  const safeQty = Number.isFinite(qty) ? Math.max(0.01, qty) : 1;
  const postingDate = normalizeDateInput(input.postingDate);
  const sourceWarehouse = input.sourceWarehouse.trim();
  const targetWarehouse = input.targetWarehouse.trim();

  return {
    doctype: "Stock Entry",
    purpose: "Material Transfer",
    posting_date: postingDate,
    from_warehouse: sourceWarehouse,
    to_warehouse: targetWarehouse,
    items: [
      {
        item_code: input.itemCode.trim(),
        qty: safeQty,
        s_warehouse: sourceWarehouse,
        t_warehouse: targetWarehouse
      }
    ],
    ...(input.note?.trim() ? { remarks: input.note.trim() } : {})
  };
}

export async function fetchStockTransferCreateOptions(): Promise<StockTransferCreateOptions> {
  const canReadStockEntry = await canReadDoctype("Stock Entry");
  if (!canReadStockEntry) {
    return {
      canCreate: false,
      warehouses: []
    };
  }

  return {
    canCreate: true,
    warehouses: await fetchSelectableWarehouses()
  };
}

export async function createStockTransferEntry(input: StockTransferCreateInput): Promise<string> {
  const doc = buildStockTransferDoc(input);
  const payload = await requestJson<FrappeMethodResponse<FrappeInsertMessage>>("/method/frappe.client.insert", undefined, {
    method: "POST",
    body: {
      doc: JSON.stringify(doc)
    }
  });
  const entryId = payload.message?.name;

  if (!entryId || entryId.trim().length === 0) {
    throw new Error("Transfer olusturuldu ancak Stock Entry numarasi donmedi.");
  }

  return entryId;
}


