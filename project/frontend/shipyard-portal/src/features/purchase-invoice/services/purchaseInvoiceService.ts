import { tenantConfig } from "../../../config/tenant";
import type {
  PurchaseInvoiceDetailData,
  PurchaseInvoiceDetailItem,
  PurchaseInvoiceFilterState,
  PurchaseInvoiceListData,
  PurchaseInvoiceListItem,
  PurchaseInvoicePaymentTone
} from "../types";

type RequestOptions = {
  method?: "GET";
};

type ResourceListOptions = {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
  limitStart?: number;
};

type FrappeListResponse<T> = {
  data?: T[];
};

type FrappeDocResponse<T> = {
  data?: T;
};

type PurchaseInvoiceRow = {
  name?: string;
  supplier?: string;
  posting_date?: string;
  due_date?: string;
  grand_total?: number;
  outstanding_amount?: number;
  status?: string;
  company?: string;
};

type PurchaseInvoiceDetailRow = PurchaseInvoiceRow & {
  remarks?: string;
  items?: PurchaseInvoiceItemRow[];
};

type PurchaseInvoiceItemRow = {
  name?: string;
  item_code?: string;
  item_name?: string;
  qty?: number;
  amount?: number;
};

const REQUEST_TIMEOUT_MS = 9000;
const DEFAULT_PAGE_SIZE = 20;

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
  const controller = new AbortController();
  const timeoutHandle = window.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildApiUrl(path, params), {
      method: options.method ?? "GET",
      credentials: "include",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "X-Frappe-Site-Name": tenantConfig.erpSiteName
      }
    });

    const payload = (await response.json().catch(() => ({}))) as {
      message?: string;
      exc_type?: string;
    };

    if (!response.ok) {
      const fallbackMessage = `ERPNext istegi basarisiz oldu (${response.status})`;
      const errorMessage = payload.message ?? payload.exc_type ?? fallbackMessage;
      throw new ApiError(errorMessage, response.status);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("ERPNext istegi zaman asimina ugradi.", 408);
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutHandle);
  }
}

async function requestResourceList<T>(doctype: string, options: ResourceListOptions): Promise<T[]> {
  const params = new URLSearchParams();
  params.set("fields", JSON.stringify(options.fields));
  params.set("limit_page_length", String(options.limit ?? DEFAULT_PAGE_SIZE));

  if (typeof options.limitStart === "number") {
    params.set("limit_start", String(options.limitStart));
  }

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

async function requestResourceDoc<T>(doctype: string, name: string): Promise<T> {
  const encodedDoctype = encodeURIComponent(doctype);
  const encodedName = encodeURIComponent(name);
  const payload = await requestJson<FrappeDocResponse<T>>(`/resource/${encodedDoctype}/${encodedName}`);

  if (!payload.data) {
    throw new ApiError("Kayit bulunamadi.", 404);
  }

  return payload.data;
}

function toAmount(value: number | null | undefined) {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
}

function toAmountLabel(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function toDateLabel(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(parsed);
}

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function toPaymentStatus(status: string | null | undefined, grandTotal: number, outstandingAmount: number) {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "overdue") {
    return {
      paymentStatusLabel: "Vadesi gecti",
      paymentStatusTone: "negative" as PurchaseInvoicePaymentTone
    };
  }

  if (outstandingAmount <= 0) {
    return {
      paymentStatusLabel: "Odendi",
      paymentStatusTone: "positive" as PurchaseInvoicePaymentTone
    };
  }

  if (outstandingAmount < grandTotal) {
    return {
      paymentStatusLabel: "Kismi odendi",
      paymentStatusTone: "warning" as PurchaseInvoicePaymentTone
    };
  }

  return {
    paymentStatusLabel: "Odenmedi",
    paymentStatusTone: "negative" as PurchaseInvoicePaymentTone
  };
}

function buildListFilters(filters: PurchaseInvoiceFilterState) {
  const next: unknown[] = [];

  if (filters.supplier.trim().length > 0) {
    next.push(["supplier", "=", filters.supplier.trim()]);
  }

  if (filters.startDate && filters.endDate) {
    next.push(["posting_date", "between", [filters.startDate, filters.endDate]]);
  } else if (filters.startDate) {
    next.push(["posting_date", ">=", filters.startDate]);
  } else if (filters.endDate) {
    next.push(["posting_date", "<=", filters.endDate]);
  }

  return next;
}

function mapListRows(rows: PurchaseInvoiceRow[]) {
  return rows.map<PurchaseInvoiceListItem>((row) => {
    const invoiceNo = row.name?.trim() || "-";
    const supplier = row.supplier?.trim() || "Tedarikci belirtilmedi";
    const grandTotal = toAmount(row.grand_total);
    const outstandingAmount = toAmount(row.outstanding_amount);
    const paymentStatus = toPaymentStatus(row.status, grandTotal, outstandingAmount);

    return {
      id: invoiceNo,
      invoiceNo,
      supplier,
      postingDateLabel: toDateLabel(row.posting_date),
      dueDateLabel: toDateLabel(row.due_date),
      company: row.company?.trim() || "Sirket belirtilmedi",
      grandTotal,
      grandTotalLabel: toAmountLabel(grandTotal),
      outstandingAmount,
      outstandingAmountLabel: toAmountLabel(outstandingAmount),
      paymentStatusLabel: paymentStatus.paymentStatusLabel,
      paymentStatusTone: paymentStatus.paymentStatusTone
    };
  });
}

function applySearch(items: PurchaseInvoiceListItem[], searchText: string) {
  const normalized = searchText.trim().toLowerCase();

  if (!normalized) {
    return items;
  }

  return items.filter((row) => {
    return (
      row.invoiceNo.toLowerCase().includes(normalized) ||
      row.supplier.toLowerCase().includes(normalized) ||
      row.company.toLowerCase().includes(normalized) ||
      row.paymentStatusLabel.toLowerCase().includes(normalized)
    );
  });
}

function toSummary(items: PurchaseInvoiceListItem[]) {
  const totalGrandAmount = items.reduce((sum, row) => sum + row.grandTotal, 0);
  const totalOutstandingAmount = items.reduce((sum, row) => sum + row.outstandingAmount, 0);

  return {
    totalCount: items.length,
    totalGrandAmount,
    totalGrandAmountLabel: toAmountLabel(totalGrandAmount),
    totalOutstandingAmount,
    totalOutstandingAmountLabel: toAmountLabel(totalOutstandingAmount)
  };
}

function collectSupplierOptions(rows: PurchaseInvoiceRow[]) {
  const all = new Set<string>();

  for (const row of rows) {
    const supplier = row.supplier?.trim() ?? "";
    if (supplier.length > 0) {
      all.add(supplier);
    }
  }

  return [...all].sort((a, b) => a.localeCompare(b, "tr"));
}

function mapDetailItems(rows: PurchaseInvoiceItemRow[] | null | undefined): PurchaseInvoiceDetailItem[] {
  const safeRows = Array.isArray(rows) ? rows : [];

  return safeRows.map((row, index) => {
    const itemCode = row.item_code?.trim() || "-";
    const itemName = row.item_name?.trim() || itemCode;
    const qty = toAmount(row.qty);
    const amount = toAmount(row.amount);

    return {
      id: row.name ?? `${itemCode}-${index}`,
      itemCode,
      itemName,
      qtyLabel: new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(qty),
      amountLabel: toAmountLabel(amount)
    };
  });
}

export function buildPurchaseInvoiceListFilters(filters: PurchaseInvoiceFilterState) {
  return buildListFilters(filters);
}

export function resolvePurchaseInvoicePaymentStatus(status: string | null | undefined, grandTotal: number, outstandingAmount: number) {
  return toPaymentStatus(status, grandTotal, outstandingAmount);
}

export function summarizePurchaseInvoices(items: PurchaseInvoiceListItem[]) {
  return toSummary(items);
}

export async function fetchPurchaseInvoiceList(
  filters: PurchaseInvoiceFilterState,
  page: number,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PurchaseInvoiceListData> {
  const currentPage = Math.max(1, page);
  const offset = (currentPage - 1) * pageSize;

  const rows = await requestResourceList<PurchaseInvoiceRow>("Purchase Invoice", {
    fields: ["name", "supplier", "posting_date", "due_date", "grand_total", "outstanding_amount", "status", "company"],
    filters: buildListFilters(filters),
    orderBy: "posting_date desc",
    limit: pageSize + 1,
    limitStart: offset
  });

  const hasNextPage = rows.length > pageSize;
  const pageRows = hasNextPage ? rows.slice(0, pageSize) : rows;
  const mappedRows = mapListRows(pageRows);
  const searchedRows = applySearch(mappedRows, filters.searchText);

  return {
    items: searchedRows,
    supplierOptions: collectSupplierOptions(pageRows),
    summary: toSummary(searchedRows),
    page: currentPage,
    pageSize,
    hasNextPage
  };
}

export async function fetchPurchaseInvoiceDetail(name: string): Promise<PurchaseInvoiceDetailData> {
  const row = await requestResourceDoc<PurchaseInvoiceDetailRow>("Purchase Invoice", name);
  const grandTotal = toAmount(row.grand_total);
  const outstandingAmount = toAmount(row.outstanding_amount);
  const paymentStatus = toPaymentStatus(row.status, grandTotal, outstandingAmount);

  return {
    invoiceNo: row.name?.trim() || name,
    supplier: row.supplier?.trim() || "Tedarikci belirtilmedi",
    postingDateLabel: toDateLabel(row.posting_date),
    dueDateLabel: toDateLabel(row.due_date),
    company: row.company?.trim() || "Sirket belirtilmedi",
    status: row.status?.trim() || "Belirtilmedi",
    remarks: row.remarks?.trim() || null,
    grandTotalLabel: toAmountLabel(grandTotal),
    outstandingAmountLabel: toAmountLabel(outstandingAmount),
    paymentStatusLabel: paymentStatus.paymentStatusLabel,
    paymentStatusTone: paymentStatus.paymentStatusTone,
    items: mapDetailItems(row.items)
  };
}
