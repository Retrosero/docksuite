import { tenantConfig } from "../../../config/tenant";
import { requestErpJson } from "../../../lib/erpApi";
import type {
  DashboardCriticalStock,
  DashboardData,
  DashboardFeedActivity,
  DashboardOpenTask,
  DashboardShiftOverview
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

type EmployeeRow = {
  name?: string;
};

type AttendanceRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  status?: string;
  shift?: string;
  attendance_date?: string;
  modified?: string;
};

type TaskRow = {
  name?: string;
  subject?: string;
  status?: string;
  priority?: string;
  owner?: string;
  exp_end_date?: string;
};

type TaskProgressRow = {
  name?: string;
  task_ref?: string;
  status?: string;
  employee?: string;
  progress_datetime?: string;
};

type ItemRow = {
  name?: string;
  item_code?: string;
  item_name?: string;
  shipyard_secondary_aisle?: string;
};

type BinRow = {
  name?: string;
  item_code?: string;
  actual_qty?: number;
  warehouse?: string;
};

type FieldReportRow = {
  name?: string;
  issue_type?: string;
  description?: string;
  status?: string;
  modified?: string;
};

type ZimmetRow = {
  name?: string;
  item?: string;
  employee?: string;
  return_status?: string;
  modified?: string;
};

type CriticalStockResult = {
  items: DashboardCriticalStock[];
  total: number;
  detailText: string;
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
  params.set("limit_page_length", String(options.limit ?? 20));

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

async function safeResourceList<T>(doctype: string, options: ResourceListOptions): Promise<T[]> {
  try {
    return await requestResourceList<T>(doctype, options);
  } catch {
    return [];
  }
}

async function getCount(doctype: string, filters?: unknown[]) {
  const params = new URLSearchParams();
  params.set("doctype", doctype);

  if (filters && filters.length > 0) {
    params.set("filters", JSON.stringify(filters));
  }

  const payload = await requestJson<FrappeMethodResponse<number>>("/method/frappe.client.get_count", params);
  return typeof payload.message === "number" ? payload.message : 0;
}

async function safeCount(doctype: string, filters: unknown[] | undefined, fallbackValue: number) {
  try {
    return await getCount(doctype, filters);
  } catch {
    return fallbackValue;
  }
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalDateLabel(value: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(parsed);
}

function toLocalDateTimeLabel(value: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function calculateShiftOverview(rows: AttendanceRow[]): DashboardShiftOverview {
  const presentCount = rows.filter((row) => normalizeStatus(row.status) === "present").length;
  const absentCount = rows.filter((row) => {
    const status = normalizeStatus(row.status);
    return status === "absent" || status === "on leave";
  }).length;
  const shiftNames = new Set(rows.map((row) => (row.shift ?? "").trim()).filter((shiftName) => shiftName.length > 0));

  return {
    totalAttendance: rows.length,
    presentCount,
    absentCount,
    shiftCount: shiftNames.size
  };
}

async function getOpenTasks() {
  const taskFilters = [["status", "not in", ["Completed", "Cancelled"]]];
  const taskRows = await safeResourceList<TaskRow>("Task", {
    fields: ["name", "subject", "status", "priority", "owner", "exp_end_date"],
    filters: taskFilters,
    orderBy: "modified desc",
    limit: 5
  });

  if (taskRows.length > 0) {
    const total = await safeCount("Task", taskFilters, taskRows.length);

    return {
      total,
      items: taskRows.map<DashboardOpenTask>((row) => ({
        id: row.name ?? "-",
        title: row.subject?.trim() || row.name || "Adsiz gorev",
        status: row.status ?? "-",
        priority: row.priority ?? "-",
        owner: row.owner ?? "-",
        dueDate: row.exp_end_date ?? null
      }))
    };
  }

  const fallbackRows = await safeResourceList<TaskProgressRow>("Task Progress", {
    fields: ["name", "task_ref", "status", "employee", "progress_datetime"],
    orderBy: "modified desc",
    limit: 5
  });

  const openItems = fallbackRows.filter((row) => {
    const status = normalizeStatus(row.status);
    return status !== "tamamlandi" && status !== "completed";
  });

  return {
    total: openItems.length,
    items: openItems.map<DashboardOpenTask>((row) => ({
      id: row.name ?? "-",
      title: row.task_ref?.trim() || row.name || "Adsiz gorev",
      status: row.status ?? "-",
      priority: "-",
      owner: row.employee ?? "-",
      dueDate: row.progress_datetime ?? null
    }))
  };
}

async function getCriticalStocks(): Promise<CriticalStockResult> {
  const itemFilters = [
    ["disabled", "=", 0],
    ["is_stock_item", "=", 1],
    ["is_critical_stock", "=", 1]
  ];

  const itemRows = await safeResourceList<ItemRow>("Item", {
    fields: ["name", "item_code", "item_name", "shipyard_secondary_aisle"],
    filters: itemFilters,
    orderBy: "modified desc",
    limit: 5
  });

  if (itemRows.length > 0) {
    const total = await safeCount("Item", itemFilters, itemRows.length);

    return {
      total,
      detailText: "Item.is_critical_stock alanina gore",
      items: itemRows.map<DashboardCriticalStock>((row) => ({
        id: row.name ?? row.item_code ?? "-",
        itemCode: row.item_code ?? "-",
        itemName: row.item_name ?? "-",
        indicator: "Kritik etiket",
        location: row.shipyard_secondary_aisle?.trim() || "Reyon bilgisi yok"
      }))
    };
  }

  const binRows = await safeResourceList<BinRow>("Bin", {
    fields: ["name", "item_code", "actual_qty", "warehouse"],
    filters: [["actual_qty", "<=", 0]],
    orderBy: "actual_qty asc",
    limit: 5
  });

  return {
    total: binRows.length,
    detailText: "Stok seviyesi 0 veya altina dusen kalemler",
    items: binRows.map<DashboardCriticalStock>((row) => ({
      id: row.name ?? row.item_code ?? "-",
      itemCode: row.item_code ?? "-",
      itemName: row.item_code ?? "-",
      indicator: `Miktar: ${row.actual_qty ?? 0}`,
      location: row.warehouse ?? "Depo bilgisi yok"
    }))
  };
}

function buildActivityTone(source: "attendance" | "task" | "field" | "zimmet") {
  if (source === "attendance") {
    return "sea" as const;
  }
  if (source === "task") {
    return "sand" as const;
  }
  if (source === "field") {
    return "steel" as const;
  }
  return "sun" as const;
}

async function getActivities(openTasks: DashboardOpenTask[]): Promise<DashboardFeedActivity[]> {
  const today = getTodayDate();

  const [attendanceRows, fieldRows, zimmetRows] = await Promise.all([
    safeResourceList<AttendanceRow>("Attendance", {
      fields: ["name", "employee", "employee_name", "status", "shift", "attendance_date", "modified"],
      filters: [["attendance_date", "=", today]],
      orderBy: "modified desc",
      limit: 3
    }),
    safeResourceList<FieldReportRow>("Field Report", {
      fields: ["name", "issue_type", "description", "status", "modified"],
      orderBy: "modified desc",
      limit: 3
    }),
    safeResourceList<ZimmetRow>("Zimmet", {
      fields: ["name", "item", "employee", "return_status", "modified"],
      orderBy: "modified desc",
      limit: 3
    })
  ]);

  const attendanceActivities = attendanceRows.map((row, index) => ({
    id: `attendance-${row.name ?? `item-${index}`}`,
    title: `Yoklama: ${row.employee_name || row.employee || "Calisan"}`,
    detail: `${row.status || "Durum yok"}${row.shift ? ` | ${row.shift}` : ""}`,
    timeValue: row.modified || row.attendance_date || "",
    timeLabel: toLocalDateTimeLabel(row.modified || row.attendance_date || null),
    tone: buildActivityTone("attendance")
  }));

  const taskActivities = openTasks.slice(0, 3).map((task) => ({
    id: `task-${task.id}`,
    title: `Acik gorev: ${task.title}`,
    detail: `${task.status} | Oncelik: ${task.priority}`,
    timeValue: task.dueDate || "",
    timeLabel: task.dueDate ? `Termin: ${toLocalDateLabel(task.dueDate)}` : "Termin yok",
    tone: buildActivityTone("task")
  }));

  const fieldActivities = fieldRows.map((row, index) => ({
    id: `field-${row.name ?? `item-${index}`}`,
    title: `Saha bildirimi: ${row.issue_type || "Kayit"}`,
    detail: row.description?.trim() || row.status || "Detay yok",
    timeValue: row.modified || "",
    timeLabel: toLocalDateTimeLabel(row.modified || null),
    tone: buildActivityTone("field")
  }));

  const zimmetActivities = zimmetRows.map((row, index) => ({
    id: `zimmet-${row.name ?? `item-${index}`}`,
    title: `Zimmet: ${row.item || "Kalem"}`,
    detail: `${row.employee || "Calisan"} | ${row.return_status || "Durum yok"}`,
    timeValue: row.modified || "",
    timeLabel: toLocalDateTimeLabel(row.modified || null),
    tone: buildActivityTone("zimmet")
  }));

  return [...attendanceActivities, ...taskActivities, ...fieldActivities, ...zimmetActivities]
    .sort((a, b) => {
      const timeA = new Date(a.timeValue || 0).getTime();
      const timeB = new Date(b.timeValue || 0).getTime();
      return timeB - timeA;
    })
    .slice(0, 8)
    .map((activity) => ({
      id: activity.id,
      title: activity.title,
      detail: activity.detail,
      timeLabel: activity.timeLabel,
      tone: activity.tone
    }));
}

function emptyDashboardData(): DashboardData {
  return {
    generatedAt: new Date().toISOString(),
    metrics: [
      { key: "employeeTotal", label: "Toplam calisan", value: "0", detail: "Veri bekleniyor", tone: "sea" },
      { key: "todayShift", label: "Bugunku vardiya", value: "0", detail: "Veri bekleniyor", tone: "sand" },
      { key: "openTask", label: "Acik gorevler", value: "0", detail: "Veri bekleniyor", tone: "steel" },
      { key: "criticalStock", label: "Kritik stok", value: "0", detail: "Veri bekleniyor", tone: "sun" }
    ],
    shiftOverview: {
      totalAttendance: 0,
      presentCount: 0,
      absentCount: 0,
      shiftCount: 0
    },
    openTasks: [],
    openTaskTotal: 0,
    criticalStocks: [],
    criticalStockTotal: 0,
    activities: []
  };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const today = getTodayDate();

  try {
    const [employees, attendanceRows, openTasksResult, criticalStockResult] = await Promise.all([
      safeResourceList<EmployeeRow>("Employee", {
        fields: ["name"],
        filters: [["status", "!=", "Left"]],
        limit: 300
      }),
      safeResourceList<AttendanceRow>("Attendance", {
        fields: ["name", "employee", "employee_name", "status", "shift", "attendance_date", "modified"],
        filters: [["attendance_date", "=", today]],
        orderBy: "modified desc",
        limit: 300
      }),
      getOpenTasks(),
      getCriticalStocks()
    ]);

    const shiftOverview = calculateShiftOverview(attendanceRows);
    const activities = await getActivities(openTasksResult.items);

    return {
      generatedAt: new Date().toISOString(),
      metrics: [
        {
          key: "employeeTotal",
          label: "Toplam calisan",
          value: String(employees.length),
          detail: "Employee kayitlarindan",
          tone: "sea"
        },
        {
          key: "todayShift",
          label: "Bugunku vardiya",
          value: String(shiftOverview.totalAttendance),
          detail: `${shiftOverview.presentCount} present / ${shiftOverview.absentCount} absent`,
          tone: "sand"
        },
        {
          key: "openTask",
          label: "Acik gorevler",
          value: String(openTasksResult.total),
          detail: "Task veya Task Progress kayitlarindan",
          tone: "steel"
        },
        {
          key: "criticalStock",
          label: "Kritik stok",
          value: String(criticalStockResult.total),
          detail: criticalStockResult.detailText,
          tone: "sun"
        }
      ],
      shiftOverview,
      openTasks: openTasksResult.items,
      openTaskTotal: openTasksResult.total,
      criticalStocks: criticalStockResult.items,
      criticalStockTotal: criticalStockResult.total,
      activities
    };
  } catch {
    return emptyDashboardData();
  }
}
