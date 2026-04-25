import { canReadDoctype, requestErpJson } from "../../../lib/erpApi";
import type {
  HrOnboardingData,
  HrOnboardingItem,
  HrOnboardingStatusSummaryItem,
  HrOnboardingSummary
} from "../types";

type FrappeListResponse<T> = {
  data?: T[];
};

type ResourceListOptions = {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
};

type EmployeeOnboardingRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  status?: string;
  boarding_status?: string;
  date_of_joining?: string;
  boarding_begins_on?: string;
  department?: string;
  designation?: string;
  modified?: string;
};

type EmployeeDocumentRecordRow = {
  employee?: string;
};

type ZimmetRow = {
  employee?: string;
  return_status?: string;
};

const REQUEST_TIMEOUT_MS = 9000;
const JOINING_SOON_DAY_WINDOW = 7;

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

function isFieldNotPermittedInQuery(error: unknown, fieldName: string) {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.toLowerCase().includes(`field not permitted in query: ${fieldName.toLowerCase()}`);
}

async function fetchOnboardingRows(): Promise<EmployeeOnboardingRow[]> {
  const attempts: Array<{ fields: string[]; orderBy: string }> = [
    {
      fields: [
        "name",
        "employee",
        "employee_name",
        "status",
        "boarding_status",
        "date_of_joining",
        "boarding_begins_on",
        "department",
        "designation",
        "modified"
      ],
      orderBy: "modified desc"
    },
    {
      fields: ["name", "employee", "employee_name", "status", "date_of_joining", "boarding_begins_on", "modified"],
      orderBy: "modified desc"
    },
    {
      fields: ["name", "employee", "status", "modified"],
      orderBy: "modified desc"
    }
  ];

  for (const attempt of attempts) {
    try {
      return await requestResourceList<EmployeeOnboardingRow>("Employee Onboarding", {
        fields: attempt.fields,
        orderBy: attempt.orderBy,
        limit: 200
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "boarding_status") || isFieldNotPermittedInQuery(error, "department")) {
        continue;
      }
      continue;
    }
  }

  return [];
}

function normalizeStatus(rawValue: string | undefined) {
  const normalized = (rawValue ?? "").trim().toLowerCase();
  if (normalized.includes("complete") || normalized.includes("tamam")) {
    return { key: "completed", label: "Tamamlandi", tone: "positive" as const };
  }
  if (
    normalized.includes("progress") ||
    normalized.includes("active") ||
    normalized.includes("process") ||
    normalized.includes("acik")
  ) {
    return { key: "in_progress", label: "Devam Ediyor", tone: "warning" as const };
  }
  if (normalized.includes("cancel") || normalized.includes("iptal")) {
    return { key: "cancelled", label: "Iptal", tone: "negative" as const };
  }
  return { key: "pending", label: "Beklemede", tone: "neutral" as const };
}

function toNormalizedDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function isJoiningSoon(joinDate: string | null) {
  if (!joinDate) {
    return false;
  }
  const parsed = toNormalizedDate(joinDate);
  if (!parsed) {
    return false;
  }

  const now = new Date();
  const diffMs = parsed.getTime() - now.getTime();
  return diffMs >= 0 && diffMs <= JOINING_SOON_DAY_WINDOW * 24 * 60 * 60 * 1000;
}

function isZimmetOpen(value: string | undefined) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return normalized !== "tam iade";
}

function buildStatusSummary(items: HrOnboardingItem[]): HrOnboardingStatusSummaryItem[] {
  const map = new Map<string, HrOnboardingStatusSummaryItem>();
  for (const item of items) {
    const normalized = normalizeStatus(item.status);
    const current = map.get(normalized.key);
    if (current) {
      current.count += 1;
      continue;
    }
    map.set(normalized.key, {
      key: normalized.key,
      label: normalized.label,
      count: 1
    });
  }

  const order = ["pending", "in_progress", "completed", "cancelled"];
  return [...map.values()].sort((left, right) => order.indexOf(left.key) - order.indexOf(right.key));
}

function buildSummary(items: HrOnboardingItem[]): HrOnboardingSummary {
  const completedCount = items.filter((item) => normalizeStatus(item.status).key === "completed").length;
  const inProgressCount = items.filter((item) => normalizeStatus(item.status).key === "in_progress").length;
  const pendingCount = items.filter((item) => normalizeStatus(item.status).key === "pending").length;
  const joiningSoonCount = items.filter((item) => isJoiningSoon(item.joinDate)).length;
  const documentRiskCount = items.filter((item) => item.documentCount === 0).length;
  const assetRiskCount = items.filter((item) => item.openZimmetCount > 0).length;

  return {
    totalRecords: items.length,
    completedCount,
    inProgressCount,
    pendingCount,
    joiningSoonCount,
    documentRiskCount,
    assetRiskCount
  };
}

export async function fetchHrOnboardingData(): Promise<HrOnboardingData> {
  const canReadOnboarding = await canReadDoctype("Employee Onboarding");
  if (!canReadOnboarding) {
    return {
      items: [],
      statusSummary: [],
      summary: {
        totalRecords: 0,
        completedCount: 0,
        inProgressCount: 0,
        pendingCount: 0,
        joiningSoonCount: 0,
        documentRiskCount: 0,
        assetRiskCount: 0
      }
    };
  }

  const onboardingRows = await fetchOnboardingRows();
  const employeeIds = [...new Set(onboardingRows.map((row) => row.employee?.trim() ?? "").filter((value) => value.length > 0))];

  let documentRows: EmployeeDocumentRecordRow[] = [];
  const canReadDocumentRecord = await canReadDoctype("Employee Document Record");
  if (canReadDocumentRecord && employeeIds.length > 0) {
    try {
      documentRows = await requestResourceList<EmployeeDocumentRecordRow>("Employee Document Record", {
        fields: ["employee"],
        filters: [["employee", "in", employeeIds]],
        limit: 2000
      });
    } catch {
      documentRows = [];
    }
  }

  let zimmetRows: ZimmetRow[] = [];
  const canReadZimmet = await canReadDoctype("Zimmet");
  if (canReadZimmet && employeeIds.length > 0) {
    try {
      zimmetRows = await requestResourceList<ZimmetRow>("Zimmet", {
        fields: ["employee", "return_status"],
        filters: [["employee", "in", employeeIds]],
        limit: 2000
      });
    } catch {
      zimmetRows = [];
    }
  }

  const documentCountByEmployee = new Map<string, number>();
  for (const row of documentRows) {
    const employeeId = row.employee?.trim() ?? "";
    if (!employeeId) {
      continue;
    }
    documentCountByEmployee.set(employeeId, (documentCountByEmployee.get(employeeId) ?? 0) + 1);
  }

  const openZimmetCountByEmployee = new Map<string, number>();
  for (const row of zimmetRows) {
    const employeeId = row.employee?.trim() ?? "";
    if (!employeeId || !isZimmetOpen(row.return_status)) {
      continue;
    }
    openZimmetCountByEmployee.set(employeeId, (openZimmetCountByEmployee.get(employeeId) ?? 0) + 1);
  }

  const items: HrOnboardingItem[] = onboardingRows.map((row) => {
    const employeeId = row.employee?.trim() || "-";
    const statusSource = row.status ?? row.boarding_status ?? "";
    const normalized = normalizeStatus(statusSource);
    const documentCount = documentCountByEmployee.get(employeeId) ?? 0;
    const openZimmetCount = openZimmetCountByEmployee.get(employeeId) ?? 0;
    const riskNotes: string[] = [];

    if (!row.date_of_joining) {
      riskNotes.push("Ise giris tarihi eksik");
    }
    if (documentCount === 0) {
      riskNotes.push("Belge kaydi bulunmuyor");
    }
    if (openZimmetCount > 0) {
      riskNotes.push(`${openZimmetCount} acik zimmet kaydi var`);
    }

    return {
      id: row.name ?? "-",
      employeeId,
      employeeName: row.employee_name?.trim() || employeeId,
      status: normalized.label,
      statusTone: normalized.tone,
      startDate: row.boarding_begins_on ?? null,
      joinDate: row.date_of_joining ?? null,
      department: row.department?.trim() || "-",
      designation: row.designation?.trim() || "-",
      updatedAt: row.modified ?? null,
      documentCount,
      openZimmetCount,
      riskNotes
    };
  });

  return {
    items,
    statusSummary: buildStatusSummary(items),
    summary: buildSummary(items)
  };
}
