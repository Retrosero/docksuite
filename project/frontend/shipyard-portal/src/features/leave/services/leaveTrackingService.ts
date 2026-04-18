import { tenantConfig } from "../../../config/tenant";
import { requestErpJson } from "../../../lib/erpApi";
import type {
  LeaveActorAccess,
  LeaveCalendarEntry,
  LeaveAllocationSummaryItem,
  LeaveApplicationItem,
  LeaveFilterState,
  LeaveSummary,
  LeaveTrackingData,
  LeaveTrackingViewMode
} from "../types";

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

type SessionActorContextMessage = {
  user?: string;
  roles?: string[];
};

type LeaveTypeSettingsMessage = {
  leave_types_text?: string;
  leave_types?: string[];
};

type EmployeeRow = {
  name?: string;
  user_id?: string;
  employee_name?: string;
  status?: string;
};

type LeaveApplicationRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  leave_type?: string;
  from_date?: string;
  to_date?: string;
  total_leave_days?: number;
  status?: string;
  workflow_state?: string;
  owner?: string;
  modified?: string;
};

type LeaveAllocationRow = {
  name?: string;
  employee?: string;
  leave_type?: string;
  from_date?: string;
  to_date?: string;
  new_leaves_allocated?: number;
  total_leaves_allocated?: number;
};

const REQUEST_TIMEOUT_MS = 9000;
const MANAGER_ROLES = new Set(["HR Manager", "HR User", "Leave Approver", "Shipyard Manager", "System Manager"]);
const STATUS_OPTIONS = ["Open", "Approved", "Rejected", "Cancelled"];
const LEAVE_TYPE_LABELS: Record<string, string> = {
  "Annual Leave": "Yillik Izin",
  "Casual Leave": "Mazeret Izni",
  "Sick Leave": "Hastalik Izni",
  "Maternity Leave": "Dogum Izni",
  "Paternity Leave": "Babalik Izni",
  "Unpaid Leave": "Ucretsiz Izin",
  "Privilege Leave": "Ozel Izin",
  "Compensatory Leave": "Telafi Izni"
};

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

async function getLoggedUserEmail() {
  try {
    const payload = await requestJson<FrappeMethodResponse<string>>("/method/frappe.auth.get_logged_user");
    return typeof payload.message === "string" ? payload.message : null;
  } catch {
    return null;
  }
}

async function getEmployeeIdByUser(userEmail: string | null) {
  if (!userEmail) {
    return null;
  }

  const rows = await fetchResourceListSafe<EmployeeRow>("Employee", {
    fields: ["name", "user_id"],
    filters: [["user_id", "=", userEmail]],
    limit: 1
  });

  return rows[0]?.name ?? null;
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

function toDayCount(value: number | null | undefined) {
  const safe = Number(value ?? 0);
  if (!Number.isFinite(safe)) {
    return 0;
  }
  return Math.max(0, safe);
}

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function toStatusMeta(statusValue: string | null | undefined, workflowState: string | null | undefined) {
  const normalized = normalizeStatus(workflowState) || normalizeStatus(statusValue);

  if (normalized === "approved") {
    return { status: "approved", statusLabel: "Onaylandi", statusTone: "positive" as const };
  }

  if (normalized === "rejected") {
    return { status: "rejected", statusLabel: "Reddedildi", statusTone: "negative" as const };
  }

  if (normalized === "cancelled") {
    return { status: "cancelled", statusLabel: "Iptal", statusTone: "negative" as const };
  }

  if (normalized === "open" || normalized === "pending") {
    return { status: "open", statusLabel: "Onay bekliyor", statusTone: "warning" as const };
  }

  return { status: "other", statusLabel: "Belirsiz", statusTone: "neutral" as const };
}

function buildApplicationFilters(filters: LeaveFilterState) {
  const next: unknown[] = [];

  if (filters.leaveType.trim().length > 0) {
    next.push(["leave_type", "=", filters.leaveType.trim()]);
  }

  if (filters.status.trim().length > 0) {
    next.push(["status", "=", filters.status.trim()]);
  }

  return next;
}

function buildAllocationFilters(filters: LeaveFilterState) {
  const next: unknown[] = [];

  if (filters.leaveType.trim().length > 0) {
    next.push(["leave_type", "=", filters.leaveType.trim()]);
  }

  return next;
}

function sortLeaveTypeOptions(rows: LeaveApplicationRow[], allocations: LeaveAllocationRow[]) {
  const all = new Set<string>();

  for (const row of rows) {
    if (row.leave_type?.trim()) {
      all.add(row.leave_type.trim());
    }
  }

  for (const row of allocations) {
    if (row.leave_type?.trim()) {
      all.add(row.leave_type.trim());
    }
  }

  return [...all].sort((a, b) => a.localeCompare(b, "tr"));
}

function normalizeLeaveTypeOptions(values: string[]) {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const value of values) {
    const candidate = value.trim();
    if (!candidate || seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);
    normalized.push(candidate);
  }

  return normalized.sort((a, b) => a.localeCompare(b, "tr"));
}

export async function fetchConfiguredLeaveTypes(): Promise<string[]> {
  try {
    const payload = await requestJson<FrappeMethodResponse<LeaveTypeSettingsMessage>>(
      "/method/shipyard_app.platform.api.get_leave_type_settings"
    );

    const message = payload.message ?? {};
    const leaveTypes = Array.isArray(message.leave_types) ? message.leave_types : [];
    return normalizeLeaveTypeOptions(leaveTypes.map((value) => value.trim()));
  } catch {
    return [];
  }
}

async function fetchResourceListSafe<T>(doctype: string, options: ResourceListOptions) {
  try {
    return await requestResourceList<T>(doctype, options);
  } catch {
    return [];
  }
}

function mapApplications(rows: LeaveApplicationRow[], searchText: string, employeeNameById: Map<string, string>): LeaveApplicationItem[] {
  const normalizedSearch = searchText.trim().toLowerCase();

  const mapped = rows.map<LeaveApplicationItem>((row) => {
    const statusMeta = toStatusMeta(row.status, row.workflow_state);
    const employeeName = row.employee_name?.trim() || employeeNameById.get((row.employee ?? "").trim()) || row.employee || "-";

    return {
      id: row.name ?? `${row.employee ?? "-"}-${row.modified ?? row.from_date ?? "leave"}`,
      applicationId: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName,
      leaveType: row.leave_type?.trim() || "Belirtilmedi",
      fromDateLabel: toDateLabel(row.from_date),
      toDateLabel: toDateLabel(row.to_date),
      totalDays: toDayCount(row.total_leave_days),
      status: statusMeta.status,
      statusLabel: statusMeta.statusLabel,
      statusTone: statusMeta.statusTone
    };
  });

  if (!normalizedSearch) {
    return mapped;
  }

  return mapped.filter((row) => {
    return (
      row.employeeName.toLowerCase().includes(normalizedSearch) ||
      row.employeeId.toLowerCase().includes(normalizedSearch) ||
      row.leaveType.toLowerCase().includes(normalizedSearch) ||
      row.statusLabel.toLowerCase().includes(normalizedSearch)
    );
  });
}

function buildAllocationSummary(
  rows: LeaveAllocationRow[],
  approvedApplications: LeaveApplicationItem[]
): LeaveAllocationSummaryItem[] {
  const usedByType = new Map<string, number>();

  for (const row of approvedApplications) {
    usedByType.set(row.leaveType, (usedByType.get(row.leaveType) ?? 0) + row.totalDays);
  }

  const grouped = new Map<string, { fromDates: string[]; toDates: string[]; allocatedDays: number; recordCount: number }>();

  for (const row of rows) {
    const leaveType = row.leave_type?.trim() || "Belirtilmedi";
    const current = grouped.get(leaveType) ?? {
      fromDates: [],
      toDates: [],
      allocatedDays: 0,
      recordCount: 0
    };

    if (row.from_date) {
      current.fromDates.push(row.from_date);
    }

    if (row.to_date) {
      current.toDates.push(row.to_date);
    }

    current.allocatedDays += toDayCount(row.total_leaves_allocated ?? row.new_leaves_allocated);
    current.recordCount += 1;
    grouped.set(leaveType, current);
  }

  return [...grouped.entries()]
    .map(([leaveType, groupedRow]) => {
      const firstFromDate = groupedRow.fromDates.sort()[0] ?? null;
      const lastToDate = groupedRow.toDates.sort().at(-1) ?? null;
      const usedDays = usedByType.get(leaveType) ?? 0;
      const remainingDays = groupedRow.allocatedDays - usedDays;

      return {
        id: leaveType,
        leaveType,
        periodLabel:
          firstFromDate && lastToDate
            ? `${toDateLabel(firstFromDate)} - ${toDateLabel(lastToDate)}`
            : "Donem belirtilmedi",
        allocatedDays: groupedRow.allocatedDays,
        usedDays,
        remainingDays,
        recordCount: groupedRow.recordCount
      };
    })
    .sort((a, b) => b.allocatedDays - a.allocatedDays);
}

async function fetchLeaveApplicationRows(filters: unknown[]) {
  const attempts: Array<{ fields: string[]; orderBy: string }> = [
    {
      fields: [
        "name",
        "employee",
        "employee_name",
        "leave_type",
        "from_date",
        "to_date",
        "total_leave_days",
        "status",
        "workflow_state",
        "owner",
        "modified"
      ],
      orderBy: "modified desc"
    },
    {
      fields: [
        "name",
        "employee",
        "employee_name",
        "leave_type",
        "from_date",
        "to_date",
        "total_leave_days",
        "status",
        "owner"
      ],
      orderBy: "from_date desc"
    },
    {
      fields: ["name", "employee", "leave_type", "from_date", "to_date", "total_leave_days", "status"],
      orderBy: "from_date desc"
    }
  ];

  for (const attempt of attempts) {
    try {
      return await requestResourceList<LeaveApplicationRow>("Leave Application", {
        fields: attempt.fields,
        filters,
        orderBy: attempt.orderBy,
        limit: 500
      });
    } catch {
      continue;
    }
  }

  return [];
}

function buildSummary(
  applications: LeaveApplicationItem[],
  allocations: LeaveAllocationSummaryItem[],
  activeEmployeeId: string | null
): LeaveSummary {
  const pendingApplications = applications.filter((row) => row.status === "open").length;
  const approvedApplications = applications.filter((row) => row.status === "approved").length;
  const rejectedApplications = applications.filter((row) => row.status === "rejected").length;
  const cancelledApplications = applications.filter((row) => row.status === "cancelled").length;
  const allocatedDays = allocations.reduce((sum, row) => sum + row.allocatedDays, 0);
  const usedDays = allocations.reduce((sum, row) => sum + row.usedDays, 0);

  return {
    totalApplications: applications.length,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    cancelledApplications,
    myOpenRequestCount: activeEmployeeId
      ? applications.filter((row) => row.employeeId === activeEmployeeId && row.status === "open").length
      : pendingApplications,
    allocatedDays,
    usedDays,
    remainingDays: allocatedDays - usedDays
  };
}

export function translateLeaveTypeLabel(value: string) {
  const normalized = value.trim();
  return LEAVE_TYPE_LABELS[normalized] ?? normalized;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (!error || typeof error !== "object") {
    return "";
  }

  const maybeError = error as { message?: unknown };
  return typeof maybeError.message === "string" ? maybeError.message : "";
}

function isFieldNotPermittedInQuery(error: unknown, fieldName: string): boolean {
  const message = extractErrorMessage(error).toLowerCase();
  return message.includes(`field not permitted in query: ${fieldName.toLowerCase()}`);
}

function formatTodayLabel() {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date());
}

const FALLBACK_ACTOR_ACCESS: LeaveActorAccess = {
  user: null,
  roles: [],
  canViewManager: false,
  defaultViewMode: "employee"
};

export async function fetchLeaveActorAccess(): Promise<LeaveActorAccess> {
  try {
    const payload = await requestJson<FrappeMethodResponse<SessionActorContextMessage>>(
      "/method/shipyard_app.platform.api.get_session_actor_context"
    );

    const message = payload.message ?? {};
    const roles = Array.isArray(message.roles) ? message.roles : [];
    const canViewManager = roles.some((role) => MANAGER_ROLES.has(role));

    return {
      user: typeof message.user === "string" ? message.user : null,
      roles,
      canViewManager,
      defaultViewMode: canViewManager ? "manager" : "employee"
    };
  } catch {
    return FALLBACK_ACTOR_ACCESS;
  }
}

export async function fetchLeaveTrackingData(
  viewMode: LeaveTrackingViewMode,
  filters: LeaveFilterState
): Promise<LeaveTrackingData> {
  const applicationFilters = buildApplicationFilters(filters);
  const applicationPromise = fetchLeaveApplicationRows(applicationFilters);
  const configuredLeaveTypesPromise = fetchConfiguredLeaveTypes();
  const employeeRowsPromise = fetchResourceListSafe<EmployeeRow>("Employee", {
    fields: ["name", "employee_name", "status", "user_id"],
    filters: [["status", "!=", "Left"]],
    orderBy: "employee_name asc",
    limit: 1000
  });

  const [loggedUserEmail, applicationRows, allocationRows, configuredLeaveTypes, employeeRows] = await Promise.all([
    getLoggedUserEmail(),
    applicationPromise,
    fetchResourceListSafe<LeaveAllocationRow>("Leave Allocation", {
      fields: ["name", "employee", "leave_type", "from_date", "to_date", "new_leaves_allocated", "total_leaves_allocated"],
      filters: buildAllocationFilters(filters),
      orderBy: "to_date desc",
      limit: 500
    }),
    configuredLeaveTypesPromise,
    employeeRowsPromise
  ]);

  const activeEmployeeId = await getEmployeeIdByUser(loggedUserEmail);
  const employeeNameById = new Map<string, string>(
    employeeRows
      .map((row) => [row.name?.trim() ?? "", row.employee_name?.trim() || row.name || ""])
      .filter(([id, label]) => id.length > 0 && label.length > 0) as Array<[string, string]>
  );
  const visibleApplicationRows =
    viewMode === "employee"
      ? applicationRows.filter((row) => {
          if (activeEmployeeId) {
            return (row.employee ?? "") === activeEmployeeId;
          }

          if (loggedUserEmail) {
            return (row.owner ?? "").trim().toLowerCase() === loggedUserEmail.trim().toLowerCase();
          }

          return false;
        })
      : applicationRows;
  const visibleAllocationRows =
    viewMode === "employee" && activeEmployeeId
      ? allocationRows.filter((row) => (row.employee ?? "") === activeEmployeeId)
      : viewMode === "employee"
        ? []
        : allocationRows;

  const applications = mapApplications(visibleApplicationRows, filters.searchText, employeeNameById);
  const approvedApplications = applications.filter((row) => row.status === "approved");
  const allocations = buildAllocationSummary(visibleAllocationRows, approvedApplications);

  return {
    dateLabel: formatTodayLabel(),
    activeEmployeeId,
    applications,
    allocations,
    leaveTypeOptions: configuredLeaveTypes.length > 0 ? configuredLeaveTypes : sortLeaveTypeOptions(applicationRows, allocationRows),
    summary: buildSummary(applications, allocations, activeEmployeeId)
  };
}

export function getLeaveStatusOptions() {
  return STATUS_OPTIONS;
}

export async function fetchApprovedLeaveCalendarEntries(): Promise<LeaveCalendarEntry[]> {
  const rows = await fetchLeaveApplicationRows([["docstatus", "=", 1]]);

  return rows
    .map((row) => ({
      id: row.name ?? `${row.employee ?? "-"}-${row.from_date ?? "leave"}`,
      employeeId: row.employee ?? "",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      leaveType: translateLeaveTypeLabel(row.leave_type?.trim() || "Belirtilmedi"),
      fromDate: row.from_date ?? "",
      toDate: row.to_date ?? row.from_date ?? "",
      status: (row.workflow_state ?? row.status ?? "Approved").trim(),
      statusLabel: "Izinli"
    }))
    .filter((row) => row.id.trim().length > 0 && row.employeeId.trim().length > 0 && row.fromDate.trim().length > 0)
    .filter((row) => row.status.toLowerCase() === "approved");
}
