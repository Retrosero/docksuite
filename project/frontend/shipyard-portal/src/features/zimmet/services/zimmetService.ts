import { requestErpJson, postErpDoc } from "../../../lib/erpApi";
import type {
  FrappeListResponse,
  ZimmetApiRow,
  ZimmetCreateInput,
  ZimmetCreateOptions,
  ZimmetData,
  ZimmetFilterState,
  ZimmetItem,
  ZimmetReturnStatus
} from "../types";

const REQUEST_TIMEOUT_MS = 9000;
const DEFAULT_LIMIT = 250;
const RETURN_STATUS_OPTIONS: ZimmetReturnStatus[] = ["Teslim Edildi", "Kismi Iade", "Tam Iade"];

type ResourceListOptions = {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
};

type EmployeeOptionRow = {
  name?: string;
};

type ItemOptionRow = {
  name?: string;
};

async function requestJson<T>(path: string, params?: URLSearchParams): Promise<T> {
  return requestErpJson<T>(path, params, {
    method: "GET",
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

function normalizeStatus(status: string | undefined): ZimmetItem["status"] {
  const normalized = (status ?? "").trim().toLowerCase();

  if (normalized === "kismi iade") {
    return "Kismi Iade";
  }

  if (normalized === "tam iade") {
    return "Tam Iade";
  }

  return "Teslim Edildi";
}

function toZimmetRow(row: ZimmetApiRow): ZimmetItem {
  const itemCode = row.item?.trim() || "-";

  return {
    id: row.name ?? "-",
    name: row.name ?? "-",
    employee: row.employee ?? "-",
    employeeName: row.employee ?? "-",
    itemCode,
    itemName: itemCode,
    quantity: row.quantity ?? 1,
    status: normalizeStatus(row.return_status),
    deliveryDate: row.delivery_date,
    returnDate: row.return_date,
    notes: row.note
  };
}

function buildFilters(state: ZimmetFilterState): unknown[] {
  const filters: unknown[] = [];

  if (state.status.trim().length > 0) {
    filters.push(["return_status", "=", state.status.trim()]);
  }

  return filters;
}

function applySearch(items: ZimmetItem[], searchText: string): ZimmetItem[] {
  const normalizedSearch = searchText.trim().toLowerCase();
  if (!normalizedSearch) return items;

  return items.filter((row) => {
    return (
      row.employeeName.toLowerCase().includes(normalizedSearch) ||
      row.itemName.toLowerCase().includes(normalizedSearch) ||
      row.itemCode.toLowerCase().includes(normalizedSearch) ||
      row.name.toLowerCase().includes(normalizedSearch)
    );
  });
}

export async function fetchZimmetData(filters: ZimmetFilterState): Promise<ZimmetData> {
  const apiFilters = buildFilters(filters);

  let rows: ZimmetApiRow[] = [];

  try {
    rows = await requestResourceList<ZimmetApiRow>("Zimmet", {
      fields: ["name", "employee", "item", "quantity", "return_status", "delivery_date", "return_date", "note"],
      filters: apiFilters.length > 0 ? apiFilters : undefined,
      orderBy: "modified desc",
      limit: DEFAULT_LIMIT
    });
  } catch {
    return {
      items: [],
      summary: { total: 0, delivered: 0, returned: 0, pending: 0 },
      statusOptions: RETURN_STATUS_OPTIONS
    };
  }

  const mappedRows = rows.map(toZimmetRow);
  const searchedRows = applySearch(mappedRows, filters.searchText);

  const summary: ZimmetData["summary"] = {
    total: searchedRows.length,
    delivered: searchedRows.filter((r) => r.status === "Teslim Edildi").length,
    returned: searchedRows.filter((r) => r.status === "Kismi Iade" || r.status === "Tam Iade").length,
    pending: 0
  };

  return {
    items: searchedRows,
    summary,
    statusOptions: RETURN_STATUS_OPTIONS
  };
}

export async function fetchZimmetCreateOptions(): Promise<ZimmetCreateOptions> {
  const [employees, items] = await Promise.all([
    requestResourceList<EmployeeOptionRow>("Employee", {
      fields: ["name"],
      filters: [["status", "!=", "Left"]],
      orderBy: "name asc",
      limit: 500
    }).catch(() => []),
    requestResourceList<ItemOptionRow>("Item", {
      fields: ["name"],
      filters: [["disabled", "=", 0], ["is_stock_item", "=", 1]],
      orderBy: "name asc",
      limit: 500
    }).catch(() => [])
  ]);

  return {
    employeeOptions: employees.map((row) => row.name ?? "").filter((row) => row.trim().length > 0),
    itemOptions: items.map((row) => row.name ?? "").filter((row) => row.trim().length > 0)
  };
}

export async function createZimmet(input: ZimmetCreateInput): Promise<string> {
  const payload: Record<string, unknown> = {
    employee: input.employee.trim(),
    item: input.item.trim(),
    quantity: input.quantity,
    delivery_date: input.deliveryDate.trim(),
    return_status: input.returnStatus ?? "Teslim Edildi"
  };

  if (input.notes?.trim()) {
    payload.note = input.notes.trim();
  }

  const response = await postErpDoc<{ data?: { name?: string } }>("Zimmet", null, payload);

  const zimmetId = response.data?.name;

  if (!zimmetId) {
    throw new Error("Zimmet kaydi olusturuldu ancak kimlik donmedi.");
  }

  return zimmetId;
}

export async function updateZimmet(zimmetId: string, input: Partial<ZimmetCreateInput>): Promise<string> {
  const payload: Record<string, unknown> = {};

  if (input.employee !== undefined) payload.employee = input.employee.trim();
  if (input.item !== undefined) payload.item = input.item.trim();
  if (input.quantity !== undefined) payload.quantity = input.quantity;
  if (input.returnStatus !== undefined) payload.return_status = input.returnStatus;
  if (input.deliveryDate !== undefined) payload.delivery_date = input.deliveryDate.trim();
  if (input.notes !== undefined) payload.note = input.notes.trim();

  const response = await postErpDoc<{ data?: { name?: string } }>("Zimmet", zimmetId, payload);

  return response.data?.name ?? zimmetId;
}

export async function deleteZimmet(zimmetId: string): Promise<string> {
  const params = new URLSearchParams();
  params.set("method", "DELETE");

  await requestErpJson<{ message?: string }>(`/resource/Zimmet/${encodeURIComponent(zimmetId)}`, params, {
    method: "DELETE",
    timeoutMs: 9000,
    cacheKeySuffix: null
  });

  return zimmetId;
}