import { requestErpJson } from "../../../lib/erpApi";
import type {
  ShiftAssignment,
  ShiftPlanInput,
  ShiftPlanningFilterState,
  ShiftPlanningSummary,
  ShiftTypeInfo
} from "../types";

type FrappeListResponse<T> = {
  data?: T[];
};

type ShiftTypeRow = {
  name?: string;
  start_time?: string;
  end_time?: string;
};

type EmployeeRow = {
  name?: string;
  employee_name?: string;
  user_id?: string;
};

type ShiftAssignmentRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  shift_type?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  modified?: string;
};

type ShiftTypeCreateInput = {
  label: string;
  start_time: string;
  end_time: string;
};

const REQUEST_TIMEOUT_MS = 9000;

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(parsed);
}

function formatShiftWindow(startTime?: string, endTime?: string) {
  const start = (startTime ?? "").trim();
  const end = (endTime ?? "").trim();
  if (start && end) return `${start}-${end}`;
  if (start) return start;
  if (end) return end;
  return "Saat tanimsiz";
}

function normalizeTimeValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  return trimmed;
}

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

function buildFilters(filters: ShiftPlanningFilterState) {
  const next: unknown[] = [];

  if (filters.employee.trim()) {
    next.push(["employee", "=", filters.employee.trim()]);
  }
  if (filters.shiftType.trim()) {
    next.push(["shift_type", "=", filters.shiftType.trim()]);
  }
  if (filters.startDate) {
    next.push(["start_date", ">=", filters.startDate]);
  }
  if (filters.endDate) {
    next.push(["end_date", "<=", filters.endDate]);
  }

  return next;
}

function buildSummary(rows: ShiftAssignment[], today: string): ShiftPlanningSummary {
  const active = rows.filter(r => {
    const start = r.start_date ?? "";
    const end = r.end_date ?? "";
    return start <= today && end >= today;
  }).length;

  const upcoming = rows.filter(r => {
    const start = r.start_date ?? "";
    return start > today;
  }).length;

  return {
    totalAssignments: rows.length,
    activeAssignments: active,
    upcomingAssignments: upcoming
  };
}

function mapAssignments(rows: ShiftAssignmentRow[], searchText: string): ShiftAssignment[] {
  const normalized = searchText.trim().toLowerCase();
  if (!normalized) return rows.map(r => ({
    name: r.name ?? "",
    employee: r.employee ?? "",
    employee_name: r.employee_name ?? r.employee ?? "",
    shift_type: r.shift_type ?? "",
    start_date: r.start_date ?? "",
    end_date: r.end_date ?? "",
    status: r.status ?? "",
    modified: r.modified ?? ""
  }));

  return rows
    .filter(r => {
      const name = (r.employee_name ?? r.employee ?? "").toLowerCase();
      const emp = (r.employee ?? "").toLowerCase();
      const shift = (r.shift_type ?? "").toLowerCase();
      return name.includes(normalized) || emp.includes(normalized) || shift.includes(normalized);
    })
    .map(r => ({
      name: r.name ?? "",
      employee: r.employee ?? "",
      employee_name: r.employee_name ?? r.employee ?? "",
      shift_type: r.shift_type ?? "",
      start_date: r.start_date ?? "",
      end_date: r.end_date ?? "",
      status: r.status ?? "",
      modified: r.modified ?? ""
    }));
}

export async function fetchShiftTypes(): Promise<ShiftTypeInfo[]> {
  const rows = await requestResourceList<ShiftTypeRow>("Shift Type", {
    fields: ["name", "start_time", "end_time"],
    orderBy: "name asc",
    limit: 100
  });

  return rows
    .map(r => ({
      id: r.name ?? "",
      label: r.name ?? "",
      start_time: r.start_time ?? "",
      end_time: r.end_time ?? ""
    }))
    .filter((row) => row.id.trim().length > 0);
}

export async function fetchEmployees(): Promise<Array<{ id: string; label: string }>> {
  const rows = await requestResourceList<EmployeeRow>("Employee", {
    fields: ["name", "employee_name", "user_id"],
    filters: [["status", "!=", "Left"]],
    orderBy: "employee_name asc",
    limit: 500
  });

  return rows
    .map(r => ({
      id: r.name ?? "",
      label: r.employee_name ?? r.name ?? ""
    }))
    .filter((row) => row.id.trim().length > 0);
}

export async function fetchShiftAssignments(filters: ShiftPlanningFilterState) {
  const today = getTodayDate();
  const filterConditions = buildFilters(filters);

  const [assignmentRows, shiftTypes, employees] = await Promise.all([
    requestResourceList<ShiftAssignmentRow>("Shift Assignment", {
      fields: ["name", "employee", "employee_name", "shift_type", "start_date", "end_date", "status", "modified"],
      filters: filterConditions.length > 0 ? filterConditions : undefined,
      orderBy: "start_date desc",
      limit: 500
    }),
    fetchShiftTypes(),
    fetchEmployees()
  ]);

  const mappedRows = mapAssignments(assignmentRows, filters.searchText);
  const summary = buildSummary(mappedRows, today);

  // Enrich with shift type info
  const shiftTypeMap = new Map(shiftTypes.map(s => [s.id, s]));
  const enrichedRows = mappedRows.map(r => {
    const shiftInfo = shiftTypeMap.get(r.shift_type);
    return {
      ...r,
      shiftLabel: shiftInfo ? `${shiftInfo.label} (${formatShiftWindow(shiftInfo.start_time, shiftInfo.end_time)})` : r.shift_type
    };
  });

  return {
    assignments: enrichedRows,
    summary,
    shiftTypes,
    employees,
    dateLabel: toDateLabel(today)
  };
}

export async function createShiftAssignment(input: ShiftPlanInput): Promise<void> {
  await requestErpJson("/resource/Shift Assignment", undefined, {
    method: "POST",
    body: {
      doctype: "Shift Assignment",
      employee: input.employee,
      shift_type: input.shift_type,
      start_date: input.start_date,
      end_date: input.end_date || input.start_date,
      status: "Active"
    }
  });
}

export async function deleteShiftAssignment(assignmentId: string): Promise<string> {
  const params = new URLSearchParams();
  params.set("method", "DELETE");

  await requestErpJson<{ message?: string }>(`/resource/Shift Assignment/${encodeURIComponent(assignmentId)}`, params, {
    method: "DELETE",
    timeoutMs: REQUEST_TIMEOUT_MS,
    cacheKeySuffix: null
  });

  return assignmentId;
}

export async function createShiftType(input: ShiftTypeCreateInput): Promise<void> {
  const normalizedLabel = input.label.trim();
  const normalizedStart = normalizeTimeValue(input.start_time);
  const normalizedEnd = normalizeTimeValue(input.end_time);

  const candidateBodies = [
    {
      doctype: "Shift Type",
      shift_type_name: normalizedLabel,
      start_time: normalizedStart,
      end_time: normalizedEnd
    },
    {
      doctype: "Shift Type",
      name: normalizedLabel,
      start_time: normalizedStart,
      end_time: normalizedEnd
    }
  ];

  let lastError: unknown = null;

  for (const body of candidateBodies) {
    try {
      await requestErpJson("/resource/Shift Type", undefined, {
        method: "POST",
        body
      });
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw (lastError instanceof Error ? lastError : new Error("Shift Type olusturulamadi."));
}
