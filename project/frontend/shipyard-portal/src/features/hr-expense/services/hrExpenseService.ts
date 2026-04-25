import { canReadDoctype, requestErpJson } from "../../../lib/erpApi";
import type { HrAdvanceItem, HrExpenseClaimItem, HrExpenseData, HrTravelRequestItem } from "../types";

type FrappeListResponse<T> = {
  data?: T[];
};

type ResourceListOptions = {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
};

type AdvanceRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  purpose?: string;
  advance_amount?: number;
  paid_amount?: number;
  currency?: string;
  status?: string;
  docstatus?: number;
  posting_date?: string;
  modified?: string;
};

type ExpenseClaimRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  purpose?: string;
  total_claimed_amount?: number;
  total_sanctioned_amount?: number;
  currency?: string;
  status?: string;
  approval_status?: string;
  docstatus?: number;
  posting_date?: string;
  modified?: string;
};

type TravelRequestRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  purpose?: string;
  from_date?: string;
  to_date?: string;
  status?: string;
  docstatus?: number;
  modified?: string;
};

const REQUEST_TIMEOUT_MS = 9000;

async function requestResourceList<T>(doctype: string, options: ResourceListOptions): Promise<T[]> {
  const params = new URLSearchParams();
  params.set("fields", JSON.stringify(options.fields));
  params.set("limit_page_length", String(options.limit ?? 300));

  if (options.filters && options.filters.length > 0) {
    params.set("filters", JSON.stringify(options.filters));
  }

  if (options.orderBy) {
    params.set("order_by", options.orderBy);
  }

  const payload = await requestErpJson<FrappeListResponse<T>>(`/resource/${encodeURIComponent(doctype)}`, params, {
    timeoutMs: REQUEST_TIMEOUT_MS
  });

  return payload.data ?? [];
}

function normalize(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function isFieldNotPermittedInQuery(error: unknown, fieldName: string) {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.toLowerCase().includes(`field not permitted in query: ${fieldName.toLowerCase()}`);
}

function toMoneyLabel(amount: number | undefined, currency: string | undefined) {
  const parsed = typeof amount === "number" ? amount : 0;
  const unit = currency?.trim() || "TRY";
  return `${parsed.toFixed(2)} ${unit}`;
}

function toStatusMeta(rawStatus: string | undefined, docstatus: number | undefined) {
  const status = rawStatus?.trim() || (docstatus === 1 ? "Submitted" : docstatus === 2 ? "Cancelled" : "Draft");
  const key = normalize(status);

  if (
    key.includes("approved") ||
    key.includes("paid") ||
    key.includes("sanctioned") ||
    key.includes("booked") ||
    key.includes("accepted")
  ) {
    return { label: status, tone: "positive" as const };
  }

  if (key.includes("rejected") || key.includes("cancel")) {
    return { label: status, tone: "negative" as const };
  }

  if (key.includes("draft") || key.includes("pending") || key.includes("requested")) {
    return { label: status, tone: "warning" as const };
  }

  return { label: status, tone: "neutral" as const };
}

function isPendingStatus(status: string) {
  const key = normalize(status);
  if (key.includes("approved") || key.includes("paid") || key.includes("booked") || key.includes("accepted")) {
    return false;
  }
  if (key.includes("rejected") || key.includes("cancel")) {
    return false;
  }
  return true;
}

async function fetchEmployeeAdvances(): Promise<AdvanceRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "purpose", "advance_amount", "currency", "status", "docstatus", "posting_date", "modified"],
    ["name", "employee", "purpose", "advance_amount", "currency", "status", "docstatus", "posting_date", "modified"],
    ["name", "employee", "advance_amount", "currency", "status", "docstatus", "posting_date", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<AdvanceRow>("Employee Advance", {
        fields,
        orderBy: "modified desc",
        limit: 300
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_name") || isFieldNotPermittedInQuery(error, "purpose")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchExpenseClaims(): Promise<ExpenseClaimRow[]> {
  const attempts: string[][] = [
    [
      "name",
      "employee",
      "employee_name",
      "purpose",
      "total_claimed_amount",
      "total_sanctioned_amount",
      "currency",
      "status",
      "approval_status",
      "docstatus",
      "posting_date",
      "modified"
    ],
    ["name", "employee", "purpose", "total_claimed_amount", "total_sanctioned_amount", "currency", "status", "approval_status", "docstatus", "posting_date", "modified"],
    ["name", "employee", "total_claimed_amount", "currency", "status", "approval_status", "docstatus", "posting_date", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<ExpenseClaimRow>("Expense Claim", {
        fields,
        orderBy: "modified desc",
        limit: 300
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_name") || isFieldNotPermittedInQuery(error, "purpose")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchTravelRequests(): Promise<TravelRequestRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "purpose", "from_date", "to_date", "status", "docstatus", "modified"],
    ["name", "employee", "purpose", "from_date", "to_date", "status", "docstatus", "modified"],
    ["name", "employee", "from_date", "to_date", "status", "docstatus", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<TravelRequestRow>("Travel Request", {
        fields,
        orderBy: "modified desc",
        limit: 300
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_name") || isFieldNotPermittedInQuery(error, "purpose")) {
        continue;
      }
    }
  }

  return [];
}

export async function fetchHrExpenseData(): Promise<HrExpenseData> {
  const [canReadAdvance, canReadExpenseClaim, canReadTravelRequest] = await Promise.all([
    canReadDoctype("Employee Advance"),
    canReadDoctype("Expense Claim"),
    canReadDoctype("Travel Request")
  ]);

  const [advanceRows, expenseRows, travelRows] = await Promise.all([
    canReadAdvance ? fetchEmployeeAdvances() : Promise.resolve([]),
    canReadExpenseClaim ? fetchExpenseClaims() : Promise.resolve([]),
    canReadTravelRequest ? fetchTravelRequests() : Promise.resolve([])
  ]);

  const advances: HrAdvanceItem[] = advanceRows.map((row) => {
    const statusMeta = toStatusMeta(row.status, row.docstatus);
    return {
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      purpose: row.purpose?.trim() || "Avans talebi",
      amountLabel: toMoneyLabel(row.advance_amount ?? row.paid_amount, row.currency),
      status: statusMeta.label,
      statusTone: statusMeta.tone,
      postingDate: row.posting_date ?? null,
      updatedAt: row.modified ?? null
    };
  });

  const expenseClaims: HrExpenseClaimItem[] = expenseRows.map((row) => {
    const statusMeta = toStatusMeta(row.status ?? row.approval_status, row.docstatus);
    return {
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      purpose: row.purpose?.trim() || "Masraf talebi",
      claimAmountLabel: toMoneyLabel(row.total_claimed_amount, row.currency),
      sanctionedAmountLabel: toMoneyLabel(row.total_sanctioned_amount, row.currency),
      status: statusMeta.label,
      statusTone: statusMeta.tone,
      postingDate: row.posting_date ?? null,
      updatedAt: row.modified ?? null
    };
  });

  const travelRequests: HrTravelRequestItem[] = travelRows.map((row) => {
    const statusMeta = toStatusMeta(row.status, row.docstatus);
    return {
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      purpose: row.purpose?.trim() || "Seyahat talebi",
      fromDate: row.from_date ?? null,
      toDate: row.to_date ?? null,
      status: statusMeta.label,
      statusTone: statusMeta.tone,
      updatedAt: row.modified ?? null
    };
  });

  return {
    advances: advances.slice(0, 40),
    expenseClaims: expenseClaims.slice(0, 40),
    travelRequests: travelRequests.slice(0, 40),
    summary: {
      totalAdvanceCount: advances.length,
      totalExpenseClaimCount: expenseClaims.length,
      totalTravelRequestCount: travelRequests.length,
      pendingAdvanceCount: advances.filter((item) => isPendingStatus(item.status)).length,
      pendingExpenseClaimCount: expenseClaims.filter((item) => isPendingStatus(item.status)).length,
      pendingTravelRequestCount: travelRequests.filter((item) => isPendingStatus(item.status)).length
    }
  };
}
