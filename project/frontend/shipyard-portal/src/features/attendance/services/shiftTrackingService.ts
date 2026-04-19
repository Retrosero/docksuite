import { tenantConfig } from "../../../config/tenant";
import { canReadDoctype, requestErpJson } from "../../../lib/erpApi";
import type {
  ShiftActorAccess,
  ShiftEmployeeRow,
  ShiftFilterState,
  ShiftTeamSummary,
  ShiftTrackingData,
  ShiftTrackingViewMode,
  ShiftTypeOption
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

type OperationalSettingsMessage = {
  attendance_lookback_days?: number;
};

type SessionActorContextMessage = {
  user?: string;
  roles?: string[];
  attendance_view?: {
    can_view_worker?: boolean;
    can_view_foreman?: boolean;
    default_mode?: "worker" | "foreman";
  };
};

type ShiftTypeRow = {
  name?: string;
  start_time?: string;
  end_time?: string;
  disabled?: number;
};

type AttendanceRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  status?: string;
  shift?: string;
  attendance_date?: string;
  in_time?: string;
  out_time?: string;
  modified?: string;
};

type EmployeeRow = {
  name?: string;
  employee_name?: string;
  designation?: string;
  shipyard_team_ref?: string;
  user_id?: string;
};

const REQUEST_TIMEOUT_MS = 9000;

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

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateBefore(dateValue: string, days: number) {
  const [yearText, monthText, dayText] = dateValue.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(year, month - 1, day);
  parsed.setDate(parsed.getDate() - days);
  const nextYear = parsed.getFullYear();
  const nextMonth = String(parsed.getMonth() + 1).padStart(2, "0");
  const nextDay = String(parsed.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
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

function toTimeLabel(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(parsed);
  }

  const fallback = value.trim();
  return fallback.length >= 5 ? fallback.slice(0, 5) : fallback;
}

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function toStatusMeta(status: string | null | undefined) {
  const normalized = normalizeStatus(status);

  if (normalized === "present") {
    return { statusKey: "present", statusLabel: "Katildi", statusTone: "positive" as const };
  }

  if (normalized === "absent") {
    return { statusKey: "absent", statusLabel: "Gelmedi", statusTone: "negative" as const };
  }

  if (normalized === "half day") {
    return { statusKey: "half_day", statusLabel: "Yarim Gun", statusTone: "warning" as const };
  }

  if (normalized === "on leave") {
    return { statusKey: "on_leave", statusLabel: "Izinli", statusTone: "neutral" as const };
  }

  return { statusKey: "other", statusLabel: "Belirsiz", statusTone: "neutral" as const };
}

function toShiftTypeOptions(rows: ShiftTypeRow[]): ShiftTypeOption[] {
  return rows.map((row) => {
    const startTime = toTimeLabel(row.start_time);
    const endTime = toTimeLabel(row.end_time);
    const hasRange = startTime !== "-" || endTime !== "-";

    return {
      id: row.name ?? "-",
      label: row.name ?? "-",
      timeRange: hasRange ? `${startTime} - ${endTime}` : "Saat araligi yok",
      isActive: row.disabled !== 1
    };
  });
}

function buildAttendanceFilters(todayDate: string, state: ShiftFilterState, lookbackDays: number) {
  const fromDate = getDateBefore(todayDate, lookbackDays);
  const filters: unknown[] = [["attendance_date", ">=", fromDate]];

  if (state.shiftType.trim().length > 0) {
    filters.push(["shift", "=", state.shiftType.trim()]);
  }

  if (state.status.trim().length > 0) {
    filters.push(["status", "=", state.status.trim()]);
  }

  return filters;
}

async function fetchAttendanceLookbackDays() {
  try {
    const payload = await requestJson<FrappeMethodResponse<OperationalSettingsMessage>>(
      "/method/shipyard_app.platform.api.get_operational_settings"
    );
    const value = Number(payload.message?.attendance_lookback_days ?? 30);
    if (!Number.isFinite(value) || value < 1) {
      return 30;
    }
    return Math.floor(value);
  } catch {
    return 30;
  }
}

function getLatestAttendanceDate(rows: AttendanceRow[], fallbackDate: string) {
  let latest = fallbackDate;

  for (const row of rows) {
    const current = (row.attendance_date ?? "").trim();
    if (!current) {
      continue;
    }
    if (current > latest) {
      latest = current;
    }
  }

  return latest;
}

function buildEmployeeMap(rows: EmployeeRow[]) {
  return new Map(
    rows.map((row) => [
      row.name ?? "",
      {
        designation: row.designation?.trim() || "-",
        teamName: row.shipyard_team_ref?.trim() || "Ekip atanmadi",
        userId: row.user_id?.trim() || ""
      }
    ])
  );
}

function toEmployeeRows(attendanceRows: AttendanceRow[], employees: EmployeeRow[], searchText: string): ShiftEmployeeRow[] {
  const employeeMap = buildEmployeeMap(employees);
  const normalizedSearch = searchText.trim().toLowerCase();

  const rows = attendanceRows.map<ShiftEmployeeRow>((row) => {
    const employeeId = row.employee ?? "-";
    const employeeMeta = employeeMap.get(employeeId);
    const statusMeta = toStatusMeta(row.status);

    return {
      id: row.name ?? `${employeeId}-${row.modified ?? row.attendance_date ?? "today"}`,
      employeeId,
      employeeName: row.employee_name?.trim() || employeeId,
      teamName: employeeMeta?.teamName ?? "Ekip atanmadi",
      shiftLabel: row.shift?.trim() || "Vardiya atanmadi",
      status: statusMeta.statusKey,
      statusLabel: statusMeta.statusLabel,
      statusTone: statusMeta.statusTone,
      designation: employeeMeta?.designation ?? "-",
      checkinTimeLabel: toTimeLabel(row.in_time),
      checkoutTimeLabel: toTimeLabel(row.out_time)
    };
  });

  if (!normalizedSearch) {
    return rows;
  }

  return rows.filter((row) => {
    return (
      row.employeeName.toLowerCase().includes(normalizedSearch) ||
      row.employeeId.toLowerCase().includes(normalizedSearch) ||
      row.teamName.toLowerCase().includes(normalizedSearch)
    );
  });
}

function getActiveEmployeeId(userEmail: string | null, employees: EmployeeRow[]) {
  if (!userEmail) {
    return null;
  }

  const normalizedEmail = userEmail.trim().toLowerCase();
  const matched = employees.find((row) => (row.user_id ?? "").trim().toLowerCase() === normalizedEmail);
  return matched?.name ?? null;
}

function buildSummary(rows: ShiftEmployeeRow[]) {
  const present = rows.filter((row) => row.status === "present").length;
  const absent = rows.filter((row) => row.status === "absent").length;
  const halfDay = rows.filter((row) => row.status === "half_day").length;
  const onLeave = rows.filter((row) => row.status === "on_leave").length;
  const shiftTypeCount = new Set(rows.map((row) => row.shiftLabel)).size;
  const teamCount = new Set(rows.map((row) => row.teamName)).size;

  return {
    total: rows.length,
    present,
    absent,
    halfDay,
    onLeave,
    shiftTypeCount,
    teamCount
  };
}

function buildTeamSummary(rows: ShiftEmployeeRow[]): ShiftTeamSummary[] {
  const grouped = new Map<string, ShiftTeamSummary>();

  for (const row of rows) {
    const key = row.teamName;
    const current = grouped.get(key) ?? {
      teamName: key,
      total: 0,
      present: 0,
      absent: 0,
      other: 0
    };

    current.total += 1;

    if (row.status === "present") {
      current.present += 1;
    } else if (row.status === "absent") {
      current.absent += 1;
    } else {
      current.other += 1;
    }

    grouped.set(key, current);
  }

  return [...grouped.values()].sort((a, b) => b.total - a.total);
}

async function getLoggedUserEmail() {
  try {
    const payload = await requestJson<FrappeMethodResponse<string>>("/method/frappe.auth.get_logged_user");
    return typeof payload.message === "string" ? payload.message : null;
  } catch {
    return null;
  }
}

const FALLBACK_ACTOR_ACCESS: ShiftActorAccess = {
  user: null,
  roles: [],
  canViewForeman: false,
  canViewWorker: true,
  defaultViewMode: "worker"
};

export async function fetchShiftActorAccess(): Promise<ShiftActorAccess> {
  try {
    const payload = await requestJson<FrappeMethodResponse<SessionActorContextMessage>>(
      "/method/shipyard_app.platform.api.get_session_actor_context"
    );
    const message = payload.message ?? {};
    const attendanceView = message.attendance_view ?? {};
    const canViewForeman = Boolean(attendanceView.can_view_foreman);
    const canViewWorker = attendanceView.can_view_worker !== false;
    const defaultViewMode =
      attendanceView.default_mode === "foreman" && canViewForeman ? "foreman" : "worker";

    return {
      user: typeof message.user === "string" ? message.user : null,
      roles: Array.isArray(message.roles) ? message.roles : [],
      canViewForeman,
      canViewWorker,
      defaultViewMode
    };
  } catch {
    return FALLBACK_ACTOR_ACCESS;
  }
}

export async function fetchShiftTrackingData(
  viewMode: ShiftTrackingViewMode,
  filters: ShiftFilterState
): Promise<ShiftTrackingData> {
  const today = getTodayDate();
  const lookbackDays = await fetchAttendanceLookbackDays();
  const attendanceFilters = buildAttendanceFilters(today, filters, lookbackDays);
  const [canReadShiftType, canReadAttendance] = await Promise.all([
    canReadDoctype("Shift Type"),
    canReadDoctype("Attendance")
  ]);

  if (!canReadAttendance) {
    return {
      dateLabel: `Son ${lookbackDays} gunde kayit yok`,
      shiftTypes: [],
      summary: buildSummary([]),
      teamSummary: [],
      employeeRows: [],
      activeEmployeeId: null,
      infoMessage: "Attendance kayitlarini goruntuleme yetkiniz bulunmuyor."
    };
  }

  const [shiftTypeRows, attendanceRows, loggedUserEmail] = await Promise.all([
    canReadShiftType
      ? requestResourceList<ShiftTypeRow>("Shift Type", {
          fields: ["name", "start_time", "end_time", "disabled"],
          orderBy: "name asc",
          limit: 100
        })
      : Promise.resolve([]),
    requestResourceList<AttendanceRow>("Attendance", {
      fields: ["name", "employee", "employee_name", "status", "shift", "attendance_date", "in_time", "out_time", "modified"],
      filters: attendanceFilters,
      orderBy: "attendance_date desc, employee_name asc",
      limit: 500
    }),
    getLoggedUserEmail()
  ]);

  const employeeIds = [...new Set(attendanceRows.map((row) => (row.employee ?? "").trim()).filter((value) => value.length > 0))];

  const employeeRows =
    employeeIds.length > 0
      ? await requestResourceList<EmployeeRow>("Employee", {
          fields: ["name", "employee_name", "designation", "shipyard_team_ref", "user_id"],
          filters: [["name", "in", employeeIds]],
          limit: employeeIds.length
        })
      : [];

  const activeEmployeeId = getActiveEmployeeId(loggedUserEmail, employeeRows);
  const mappedRows = toEmployeeRows(attendanceRows, employeeRows, filters.searchText);
  const workerFallbackInfo =
    viewMode === "worker" && !activeEmployeeId
      ? "Profiliniz personel kaydiyla eslesmedigi icin genel liste gosteriliyor."
      : null;
  const visibleRows =
    viewMode === "worker" && activeEmployeeId ? mappedRows.filter((row) => row.employeeId === activeEmployeeId) : mappedRows;
  const latestAttendanceDate = getLatestAttendanceDate(attendanceRows, today);

  return {
    dateLabel:
      attendanceRows.length > 0
        ? toDateLabel(latestAttendanceDate)
        : `Son ${lookbackDays} gunde kayit yok`,
    shiftTypes: toShiftTypeOptions(shiftTypeRows).filter((row) => row.isActive),
    summary: buildSummary(visibleRows),
    teamSummary: buildTeamSummary(visibleRows),
    employeeRows: visibleRows,
    activeEmployeeId,
    infoMessage: workerFallbackInfo
  };
}
