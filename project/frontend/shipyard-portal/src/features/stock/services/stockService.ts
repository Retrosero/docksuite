import { tenantConfig } from "../../../config/tenant";
import { requestErpJson, postErpDoc } from "../../../lib/erpApi";
import type { StockCreateInput, StockCreateOptions, StockData, StockFilterState, StockItem, StockSummary } from "../types";

type RequestOptions = {
  method?: "GET";
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

type BinRow = {
  item_code?: string;
  actual_qty?: number | null;
};

const REQUEST_TIMEOUT_MS = 9000;
const DEFAULT_LIMIT = 250;
let cachedStockListPageSize: number | null = null;

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

async function getDoctypeFieldSet(doctype: string) {
  const params = new URLSearchParams();
  params.set("doctype", doctype);

  const payload = await requestJson<FrappeMethodResponse<FrappeDoctypeMeta>>(
    "/method/frappe.client.get_meta",
    params
  );

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

function toStockItemRows(rows: ItemRow[], qtyMap: Map<string, number>, hasCriticalField: boolean): StockItem[] {
  return rows.map((row) => {
    const itemCode = row.item_code?.trim() || row.name || "-";
    const stockQtyValue = qtyMap.has(itemCode) ? qtyMap.get(itemCode) ?? 0 : null;
    const stockQtyLabel =
      stockQtyValue === null
        ? "Stok bilgisi yok"
        : `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(stockQtyValue)} adet`;
    const isCritical = hasCriticalField ? toBoolFromCheck(row.is_critical_stock) : false;

    return {
      id: row.name ?? itemCode,
      itemCode,
      itemName: row.item_name?.trim() || itemCode,
      itemGroup: row.item_group?.trim() || "Grup belirtilmedi",
      barcode: row.barcode?.trim() || null,
      secondaryAisle: row.shipyard_secondary_aisle?.trim() || null,
      isCritical,
      stockQtyLabel,
      stockQtyValue,
      tone: isCritical ? "critical" : "neutral"
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

function buildSummary(items: StockItem[]): StockSummary {
  return {
    totalItems: items.length,
    totalCriticalItems: items.filter((row) => row.isCritical).length,
    noStockItems: items.filter((row) => row.stockQtyValue !== null && row.stockQtyValue <= 0).length,
    withBarcodeItems: items.filter((row) => (row.barcode ?? "").length > 0).length
  };
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
      fields: ["item_code", "actual_qty"],
      filters: [["item_code", "in", itemCodes]],
      limit: Math.max(itemCodes.length * 3, pageSize)
    });
  } catch {
    return [];
  }
}

export async function fetchStockData(filters: StockFilterState): Promise<StockData> {
  const pageSize = await resolveStockListPageSize();
  const itemFieldSet = await getDoctypeFieldSet("Item");
  const hasBarcodeField = itemFieldSet.has("barcode");
  const hasSecondaryAisleField = itemFieldSet.has("shipyard_secondary_aisle");
  const hasCriticalField = itemFieldSet.has("is_critical_stock");

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

  const itemRows = await requestResourceList<ItemRow>("Item", {
    fields,
    filters: buildItemFilters(filters, hasCriticalField),
    orderBy: "modified desc",
    limit: pageSize
  });

  const itemCodes = [...new Set(itemRows.map((row) => row.item_code?.trim() || "").filter((row) => row.length > 0))];
  const binRows = await fetchStockBins(itemCodes, pageSize);
  const qtyMap = buildStockQtyMap(binRows);

  const mappedRows = toStockItemRows(itemRows, qtyMap, hasCriticalField);
  const searchedRows = applySearch(mappedRows, filters.searchText);
  const sortedRows = sortByCriticalAndName(searchedRows);

  return {
    items: sortedRows,
    summary: buildSummary(sortedRows),
    itemGroupOptions: sortItemGroups(mappedRows),
    hasCriticalField
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
  const [itemGroups, uoms] = await Promise.all([
    requestResourceList<ItemGroupRow>("Item Group", {
      fields: ["name", "is_group"],
      orderBy: "name asc",
      limit: 500
    }).catch(() => []),
    requestResourceList<UomRow>("UOM", {
      fields: ["name", "enabled"],
      orderBy: "name asc",
      limit: 500
    }).catch(() => [])
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


