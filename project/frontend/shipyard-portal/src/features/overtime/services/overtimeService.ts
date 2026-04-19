import { canReadDoctype, ErpRequestError, requestErpJson } from "../../../lib/erpApi";
import type {
  OvertimeActorAccess,
  OvertimeBulkCreateInput,
  OvertimeBulkCreateResult,
  OvertimeCreateInput,
  OvertimeData,
  OvertimeEmployeeOption,
  OvertimeFilterState,
  OvertimeRequest,
  OvertimeSummary
} from "../types";

type FrappeListResponse<T> = {
  data?: T[];
};

type FrappeMethodResponse<T> = {
  message?: T;
};

type EmployeeListMessage = {
  items?: EmployeeRow[];
  total?: number;
};

type SessionActorContextMessage = {
  user?: string;
  roles?: string[];
};

type EmployeeRow = {
  name?: string;
  employee_name?: string;
  user_id?: string;
};

const REQUEST_TIMEOUT_MS = 9000;

async function requestJson<T>(path: string, params?: URLSearchParams): Promise<T> {
  return requestErpJson<T>(path, params, {
    timeoutMs: REQUEST_TIMEOUT_MS
  });
}

async function requestResourceList<T>(doctype: string, options: {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
}): Promise<T[]> {
  const params = new URLSearchParams();
  params.set("fields", JSON.stringify(options.fields));
  params.set("limit_page_length", String(options.limit ?? 200));

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

async function requestResourceListSafe<T>(doctype: string, options: {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
}) {
  try {
    return await requestResourceList<T>(doctype, options);
  } catch (error) {
    if (error instanceof ErpRequestError && (error.status === 404 || error.status === 500)) {
      return [];
    }
    throw error;
  }
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateLabel(value: string) {
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

function buildRequestFilters(filters: OvertimeFilterState) {
  const next: unknown[] = [];

  if (filters.employee.trim()) {
    next.push(["employee", "=", filters.employee.trim()]);
  }
  if (filters.status.trim()) {
    next.push(["status", "=", filters.status.trim()]);
  }
  if (filters.startDate) {
    next.push(["date", ">=", filters.startDate]);
  }
  if (filters.endDate) {
    next.push(["date", "<=", filters.endDate]);
  }

  return next;
}

function buildSummary(rows: OvertimeRequest[]): OvertimeSummary {
  const pending = rows.filter(r => r.status === "Open" || r.workflow_state === "Open").length;
  const approved = rows.filter(r => r.status === "Approved" || r.workflow_state === "Approved").length;
  const rejected = rows.filter(r => r.status === "Rejected" || r.workflow_state === "Rejected").length;
  const totalHours = rows.reduce((sum, r) => sum + (r.hours || 0), 0);
  const approvedHours = rows
    .filter(r => r.status === "Approved" || r.workflow_state === "Approved")
    .reduce((sum, r) => sum + (r.hours || 0), 0);

  return {
    totalRequests: rows.length,
    pendingRequests: pending,
    approvedRequests: approved,
    rejectedRequests: rejected,
    totalHours,
    approvedHours
  };
}

function mapRows(rows: OvertimeRequest[], searchText: string): OvertimeRequest[] {
  const normalized = searchText.trim().toLowerCase();
  if (!normalized) return rows;

  return rows.filter(row => {
    return (
      (row.employee_name ?? "").toLowerCase().includes(normalized) ||
      (row.employee ?? "").toLowerCase().includes(normalized) ||
      (row.reason ?? "").toLowerCase().includes(normalized)
    );
  });
}

function sortRowsByDate(rows: OvertimeRequest[]): OvertimeRequest[] {
  return [...rows].sort((left, right) => {
    const leftDate = new Date(left.date ?? "").getTime();
    const rightDate = new Date(right.date ?? "").getTime();

    if (Number.isFinite(leftDate) && Number.isFinite(rightDate) && leftDate !== rightDate) {
      return rightDate - leftDate;
    }

    const leftModified = new Date(left.modified ?? "").getTime();
    const rightModified = new Date(right.modified ?? "").getTime();
    if (Number.isFinite(leftModified) && Number.isFinite(rightModified) && leftModified !== rightModified) {
      return rightModified - leftModified;
    }

    return (right.date ?? "").localeCompare(left.date ?? "");
  });
}

async function getLoggedUserEmail() {
  try {
    const payload = await requestJson<FrappeMethodResponse<string>>("/method/frappe.auth.get_logged_user");
    return typeof payload.message === "string" ? payload.message : null;
  } catch {
    return null;
  }
}

async function getEmployeeIdByUser(userEmail: string | null) {
  if (!userEmail) return null;

  try {
    const rows = await requestResourceList<EmployeeRow>("Employee", {
      fields: ["name", "user_id"],
      filters: [["user_id", "=", userEmail]],
      limit: 1
    });

    return rows[0]?.name ?? null;
  } catch {
    return null;
  }
}

const FALLBACK_ACTOR_ACCESS: OvertimeActorAccess = {
  user: null,
  roles: [],
  canViewManager: false,
  canApprove: false,
  defaultViewMode: "employee"
};

const MANAGER_ROLES = new Set(["HR Manager", "HR User", "Leave Approver", "Shipyard Manager", "System Manager"]);

export async function fetchOvertimeActorAccess(): Promise<OvertimeActorAccess> {
  try {
    const payload = await requestJson<FrappeMethodResponse<SessionActorContextMessage>>(
      "/method/shipyard_app.platform.api.get_session_actor_context"
    );

    const message = payload.message ?? {};
    const roles = Array.isArray(message.roles) ? message.roles : [];
    const canViewManager = roles.some(role => MANAGER_ROLES.has(role));
    const canApprove = canViewManager;

    return {
      user: typeof message.user === "string" ? message.user : null,
      roles,
      canViewManager,
      canApprove,
      defaultViewMode: canViewManager ? "manager" : "employee"
    };
  } catch {
    return FALLBACK_ACTOR_ACCESS;
  }
}

export async function fetchOvertimeData(
  viewMode: "employee" | "manager",
  filters: OvertimeFilterState
): Promise<OvertimeData> {
  const requestFilters = buildRequestFilters(filters);

  const [requestRows, employeeOptions, loggedUserEmail] = await Promise.all([
    requestResourceListSafe<OvertimeRequest>("Overtime Request", {
      fields: [
        "name",
        "employee",
        "employee_name",
        "date",
        "hours",
        "reason",
        "status",
        "workflow_state",
        "modified",
        "overtime_batch",
        "approved_by",
        "approved_at",
        "rejection_reason"
      ],
      filters: requestFilters.length > 0 ? requestFilters : undefined,
      orderBy: "date desc, modified desc",
      limit: 500
    }),
    fetchEmployeeOptions(),
    getLoggedUserEmail()
  ]);

  const activeEmployeeId = await getEmployeeIdByUser(loggedUserEmail);

  const visibleRows =
    viewMode === "employee" && activeEmployeeId
      ? requestRows.filter(r => (r.employee ?? "") === activeEmployeeId)
      : requestRows;

  const mappedRows = sortRowsByDate(mapRows(visibleRows, filters.searchText));
  const summary = buildSummary(mappedRows);

  return {
    dateLabel: toDateLabel(getTodayDate()),
    requests: mappedRows,
    summary,
    employeeOptions,
    activeEmployeeId
  };
}

export async function createOvertimeRequest(input: OvertimeCreateInput): Promise<string | null> {
  const response = await requestErpJson<{ data?: { name?: string } }>("/resource/Overtime Request", undefined, {
    method: "POST",
    body: {
      doctype: "Overtime Request",
      employee: input.employee || undefined,
      date: input.date,
      hours: input.hours,
      reason: input.reason,
      status: "Open"
    }
  });
  return response.data?.name ?? null;
}

type OvertimeApprovalQueueMessage = {
  count?: number;
  items?: OvertimeRequest[];
};

type OvertimeApprovalActionResult = {
  ok?: boolean;
  updated_count?: number;
  updated?: string[];
  skipped?: Array<{ name: string; reason: string }>;
};

export async function createBulkOvertimeRequests(input: OvertimeBulkCreateInput): Promise<OvertimeBulkCreateResult> {
  const uniqueEmployeeIds = Array.from(new Set(input.employeeIds.map(id => id.trim()).filter(Boolean)));

  if (uniqueEmployeeIds.length === 0) {
    return {
      ok: false,
      batch: "",
      total: 0,
      created_count: 0,
      skipped_count: 0,
      failed_count: 0,
      created_requests: [],
      skipped_employees: [],
      failed_rows: []
    };
  }

  const payload = {
    employee_ids: uniqueEmployeeIds,
    date: input.date,
    hours: input.hours,
    reason: input.reason
  };

  try {
    const response = await requestErpJson<{ message?: OvertimeBulkCreateResult }>(
      "/method/shipyard_app.overtime_api.create_bulk_overtime_requests",
      undefined,
      {
        method: "POST",
        body: {
          payload: JSON.stringify(payload)
        }
      }
    );
    return response.message ?? {
      ok: false,
      batch: "",
      total: uniqueEmployeeIds.length,
      created_count: 0,
      skipped_count: 0,
      failed_count: uniqueEmployeeIds.length,
      created_requests: [],
      skipped_employees: [],
      failed_rows: uniqueEmployeeIds.map(employee => ({ employee, message: "Toplu mesai yaniti bos dondu." }))
    };
  } catch (error) {
    if (!(error instanceof ErpRequestError) || ![403, 404, 500].includes(error.status)) {
      throw error;
    }

    const createdRequests: string[] = [];
    const failedRows: Array<{ employee: string; message: string }> = [];

    for (const employeeId of uniqueEmployeeIds) {
      try {
        const requestId = await createOvertimeRequest({
          employee: employeeId,
          date: input.date,
          hours: input.hours,
          reason: input.reason
        });
        if (requestId) {
          createdRequests.push(requestId);
        }
      } catch (createError) {
        failedRows.push({
          employee: employeeId,
          message: createError instanceof Error ? createError.message : "Mesai kaydi olusturulamadi."
        });
      }
    }

    return {
      ok: failedRows.length === 0,
      batch: "",
      total: uniqueEmployeeIds.length,
      created_count: uniqueEmployeeIds.length - failedRows.length,
      skipped_count: 0,
      failed_count: failedRows.length,
      created_requests: createdRequests,
      skipped_employees: [],
      failed_rows: failedRows
    };
  }
}

export async function fetchOvertimeApprovalQueue(filters: OvertimeFilterState): Promise<OvertimeRequest[]> {
  const params = new URLSearchParams();
  params.set("status", filters.status.trim() || "Open");
  params.set("limit", "500");

  if (filters.employee.trim()) {
    params.set("employee", filters.employee.trim());
  }
  if (filters.startDate) {
    params.set("start_date", filters.startDate);
  }
  if (filters.endDate) {
    params.set("end_date", filters.endDate);
  }
  if (filters.searchText.trim()) {
    params.set("search_text", filters.searchText.trim());
  }

  const response = await requestErpJson<{ message?: OvertimeApprovalQueueMessage }>(
    "/method/shipyard_app.overtime_api.list_overtime_approval_queue",
    params
  );
  return response.message?.items ?? [];
}

async function requestOvertimeApprovalAction(path: string, requestIds: string[], rejectionReason?: string) {
  const payload = {
    request_ids: requestIds,
    rejection_reason: rejectionReason
  };
  const response = await requestErpJson<{ message?: OvertimeApprovalActionResult }>(path, undefined, {
    method: "POST",
    body: {
      payload: JSON.stringify(payload)
    }
  });
  return response.message ?? { updated_count: 0, updated: [], skipped: [] };
}

export async function approveOvertimeRequests(requestIds: string[]) {
  return requestOvertimeApprovalAction("/method/shipyard_app.overtime_api.approve_overtime_requests", requestIds);
}

export async function rejectOvertimeRequests(requestIds: string[], rejectionReason: string) {
  return requestOvertimeApprovalAction(
    "/method/shipyard_app.overtime_api.reject_overtime_requests",
    requestIds,
    rejectionReason
  );
}

export function getOvertimeStatusOptions() {
  return ["Open", "Approved", "Rejected", "Cancelled"];
}

async function fetchEmployeeOptions(): Promise<OvertimeEmployeeOption[]> {
  const canReadEmployee = await canReadDoctype("Employee");
  let rows: EmployeeRow[] = [];

  if (canReadEmployee) {
    try {
      rows = await requestResourceListSafe<EmployeeRow>("Employee", {
        fields: ["name", "employee_name", "user_id"],
        orderBy: "employee_name asc",
        limit: 300
      });
    } catch {
      // Fall back to custom personnel endpoint when Employee resource is not readable in this tenant/session.
      rows = [];
    }
  }

  if (rows.length === 0) {
    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("page_size", "300");
      params.set("search", "");

      const payload = await requestJson<FrappeMethodResponse<EmployeeListMessage>>(
        "/method/shipyard_app.personnel_api.list_employees",
        params
      );
      rows = payload.message?.items ?? [];
    } catch (error) {
      if (!(error instanceof ErpRequestError) || ![403, 404, 500].includes(error.status)) {
        throw error;
      }
      rows = [];
    }
  }

  const uniqueRows = new Map<string, OvertimeEmployeeOption>();

  for (const row of rows) {
    const id = (row.name ?? "").trim();
    if (!id) {
      continue;
    }
    uniqueRows.set(id, {
      id,
      label: (row.employee_name ?? row.name ?? "").trim() || id
    });
  }

  return Array.from(uniqueRows.values()).sort((left, right) => left.label.localeCompare(right.label, "tr"));
}
